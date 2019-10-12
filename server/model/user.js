const crypto=require('crypto');
const cache = require("../lib/redis.js");
const {User} = require('../lib/schema.js');
const bookshelf = require('../lib/bookshelf.js');
const validateUser = require("../lib/validation.js");
let getFacebookProfile = require("../lib/facebook.js"); 
const errorHandling = require("../lib/errorHandling.js").errorHandling;
const tokenDuration = 30*24*60*60*1000;
const cacheDuration = 30*24*60*60; 
let encrypt = (originalData) => {
    let sha256 = crypto.createHash('sha256');
    sha256.update(originalData);
    return sha256.digest('hex');
}
module.exports={
    // Sign up
    new: (userData) => {
        let {provider, name, email, password, role} = userData;
        if (!name || !email || !password) {
            return new Error('Request Error: name, email and password are required.');
        }
        return bookshelf.transaction( async (transaction) => {
            let existedUser = await User.where({provider, email}).fetch({require:false});
            if (!existedUser) {
                let now = Date.now();
                let encryptedPassword = encrypt(password);
                let accessToken = encrypt(name + email + now);

                let user = await User.forge({provider, name, email, password: encryptedPassword, role, createdAt: now, accessToken, accessExpired: now+(30*24*60*60*1000), point: 100}, {transacting: transaction}).save();
                cache.set(accessToken, JSON.stringify(user), 'EX', cacheDuration);
                return (user.toJSON());
            }
            else {
                return new Error('Email Already Exists'); 
            }
        }).catch((err) => {
            return errorHandling(err);
        });
    },
    // Sign In
    read: (userData) => {
        let {provider, email, password, accessToken} = userData; 
        if (provider === 'native') {
            if (!email || !password) {
                return new Error('Request Error: email and password are required.'); 
            }
            return bookshelf.transaction( async (transaction) => {
                let encryptedPassword = encrypt(password);

                let user = await User.where({email, password: encryptedPassword}).fetch({require:false});
                if (!user) {
                    return new Error('Sign In Error: email or password wrong');
                }
                let userJSON = user.toJSON();
                cache.del(userJSON.accessToken);
                let now = Date.now();
               
                let accessToken = encrypt(userJSON.name + userJSON.email + now);

                user = await user.set({accessToken, accessExpired: now+tokenDuration}, {transacting: transaction}).save();
                cache.set(accessToken, JSON.stringify(user), 'EX', cacheDuration);
                return (user.toJSON());
            }).catch((err) => {
                return errorHandling(err);
            });
        }
        else if (provider === 'facebook') {
            if (!accessToken) {
                return new Error('Request Error: accessToken is required.'); 
            }
            return bookshelf.transaction( async (transaction) => {
                // Get profile from facebook
		        return getFacebookProfile(accessToken).then(async (profile) => {
                    if(!profile.id || !profile.name|| !profile.email){
                        return new Error("Permissions Error: id, name, email are required.");
                    }
                    let role = 'student'; // only allow student for facebook log in
                    let now = Date.now();
                    let facebookID = profile.id;
                    let {name, email} = profile;
                    let picture = "https://graph.facebook.com/" + profile.id + "/picture?type=large";   
                    let accessToken = encrypt(name + email + now);
                    let accessExpired = now + tokenDuration;

                    let user = await User.where({facebookID, provider}).fetch({require:false});
                    if (!user) {
                        // insert, return token, expired
                        user = await User.forge({provider, name, email, role, createdAt: now, accessToken, accessExpired, photo: picture, facebookID, point: 100}, {transacting: transaction}).save();
                        cache.set(accessToken, JSON.stringify(user), 'EX', cacheDuration);
                        return (user.toJSON());
                    } 
                    else {
                        cache.del(user.toJSON().accessToken);
                        // update, return token, expired
                        user = await user.set({name, email, accessToken, accessExpired, photo: picture}, {transacting: transaction}).save();
                        cache.set(accessToken, JSON.stringify(user), 'EX', cacheDuration);
                        return (user.toJSON());
                    }
                });
            }).catch((err) => {
                return errorHandling(err);
            }); 

        }
    },
    readById: (id) => {
        return bookshelf.transaction( async (transaction) => {
            if (!id)
                return new Error('User Not Found');
            let user = await User.where({id}).fetch({require:false});
            return (user) ? user.toJSON() : new Error('User Not Found'); 
        }).catch((err) => {
            return errorHandling(err);
        });
    },
    readByToken: (accessToken) => {
        return bookshelf.transaction( async (transaction) => {
            let user = await validateUser(accessToken);
            if (user) {
                return (user.toJSON());
            }
            else {
                return new Error('User Not Found'); 
            }
        }).catch((err) => {
            return errorHandling(err);
        });
    },
    verifyByToken: (accessToken) => {
        return cache.getAsync(accessToken).then((user) => {
            return(user) ?  JSON.parse(user) : new Error('User Not Found'); 
        }).catch((err) => {
            return errorHandling(err);
        });
    } 
};

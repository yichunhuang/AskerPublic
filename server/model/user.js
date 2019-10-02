const bookshelf = require('../lib/bookshelf.js');
const crypto=require('crypto');
const client = require("../lib/redis.js");
const request = require('request');
const User = bookshelf.Model.extend({
    tableName: 'user'
});

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
                let shaPassword=crypto.createHash('sha256');
                shaPassword.update(password); // should be salted later
                let encryptedPassword = shaPassword.digest('hex');
                let shaToken=crypto.createHash('sha256');
                shaToken.update(name + email + now);
                let accessToken = shaToken.digest('hex');  
                let user = await User.forge({provider, name, email, password: encryptedPassword, role, createdAt: now, accessToken, accessExpired: now+(30*24*60*60*1000), point: 100}, {transacting: transaction}).save();
                client.set(accessToken, JSON.stringify(user), 'EX', (30*24*60*60));
                return (user.toJSON());
            }
            else {
                return new Error('Email Already Exists'); 
            }
        }).catch((err) => {
            return new Error(err);
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
                let shaPassword=crypto.createHash('sha256');
                shaPassword.update(password); // should be salted later
                let encryptedPassword = shaPassword.digest('hex');
                let user = await User.where({email, password: encryptedPassword}).fetch({require:false});
                if (!user) {
                    return new Error('Sign In Error: email or password wrong');
                }
                client.del(user.toJSON().accessToken);
                let now = Date.now();
                let shaToken=crypto.createHash('sha256');
                shaToken.update(user.toJSON().name + user.toJSON().email + now);
                let accessToken = shaToken.digest('hex');   
                user = await user.set({accessToken, accessExpired: now+(30*24*60*60*1000)}, {transacting: transaction}).save();
                client.set(accessToken, JSON.stringify(user), 'EX', (30*24*60*60));
                return (user.toJSON());
            }).catch((err) => {
                return new Error(err);
            });
        }
        else if (provider === 'facebook') {
            if (!accessToken) {
                return new Error('Request Error: accessToken is required.'); 
            }
            return bookshelf.transaction( async (transaction) => {
                // Get profile from facebook
		        return getFacebookProfile(accessToken).then(async (profile) => {
                    if(!profile.id||!profile.name||!profile.email){
                        return new Error("Permissions Error: id, name, email are required.");
                    }
                    let role = 'student'; // only allow student for facebook log in
                    let now = Date.now();
                    let facebookID = profile.id;
                    let {name, email} = profile;
                    let picture = "https://graph.facebook.com/"+profile.id+"/picture?type=large"; 
                    let shaToken=crypto.createHash('sha256');
                    shaToken.update(name + email + now);
                    let accessToken = shaToken.digest('hex');    
                    let accessExpired = now+(30*24*60*60*1000);

                    let user = await User.where({facebookID, provider}).fetch({require:false});
                    if (!user) {
                        // insert & return token & expired
                        user = await User.forge({provider, name, email, role, createdAt: now, accessToken, accessExpired, photo: picture, facebookID, point: 100}, {transacting: transaction}).save();
                        client.set(accessToken, JSON.stringify(user), 'EX', (30*24*60*60));
                        return (user.toJSON());
                    } 
                    else {
                        client.del(user.toJSON().accessToken);
                        // update & return token & expired
                        user = await user.set({name, email, accessToken, accessExpired, photo: picture}, {transacting: transaction}).save();
                        client.set(accessToken, JSON.stringify(user), 'EX', (30*24*60*60));
                        return (user.toJSON());
                    }
                });
            }).catch((err) => {
                return new Error(err);
            }); 

        }
    },
    // Read By Id
    readById: (id) => {
        return bookshelf.transaction( async (transaction) => {
            if (!id)
                return new Error('User Not Found');
            let user = await User.where({id}).fetch({require:false});
            return (user) ? user.toJSON() : new Error('User Not Found'); 
        }).catch((err) => {
            return new Error(err);
        });
    },
    // Read By Token
    readByToken: (accessToken) => {
        // return client.getAsync(accessToken).then((user) => {
        //     return(user) ?  JSON.parse(user) : new Error('User Not Found'); 
        // }).catch((err) => {
        //     return new Error(err);
        // });
        return bookshelf.transaction( async (transaction) => {
            let user = await User.where({accessToken}).andWhere('accessExpired', '>', Date.now()).fetch({require:false});
            if (user) {
                return (user.toJSON());
            }
            else {
                return new Error('User Not Found'); 
            }
        }).catch((err) => {
            return new Error(err);
        });
    },
    verifyByToken: (accessToken) => {
        return client.getAsync(accessToken).then((user) => {
            return(user) ?  JSON.parse(user) : new Error('User Not Found'); 
        }).catch((err) => {
            return new Error(err);
        });
        // return bookshelf.transaction( async (transaction) => {
        //     let user = await User.where({accessToken}).andWhere('accessExpired', '>', Date.now()).fetch({require:false});
        //     if (user) {
        //         return (user.toJSON());
        //     }
        //     else {
        //         return new Error('User Not Found'); 
        //     }
        // }).catch((err) => {
        //     return new Error(err);
        // });
    } 
};

let getFacebookProfile=function(accessToken){
    return new Promise((resolve, reject)=>{
        if(!accessToken){
            resolve(null);
            return;
        }
        request({
            url:"https://graph.facebook.com/me?fields=id,name,email&access_token="+accessToken,
            method:"GET"
        }, function(error, response, body){
            body=JSON.parse(body);
            if(body.error){
                reject(body.error);
            }else{
                resolve(body);
            }
        });
    });
};
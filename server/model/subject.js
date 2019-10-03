const bookshelf = require('../lib/bookshelf.js');
const cache = require("../lib/redis.js");
const {Subject} = require('../lib/schema.js');

module.exports={
    // ! if add new subject, cache should be clear manually
    readAll: (id) => {
        return bookshelf.transaction( async (transaction) => {
            return cache.getAsync('subjects').then(async (cacheSubjects) => {
                if (cacheSubjects) 
                    return JSON.parse(cacheSubjects);
                let subject = await Subject.fetchAll({require:false});
                if (subject) {
                    cache.set('subjects', JSON.stringify(subject));
                    return (subject.toJSON());
                }
                else {
                    return new Error('Subject Not Found'); 
                }
            })
        }).catch((err) => {
            return new Error(err);
        });
    }
};
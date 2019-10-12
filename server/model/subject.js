const bookshelf = require('../lib/bookshelf.js');
const cache = require("../lib/redis.js");
const errorHandling = require("../lib/errorHandling.js").errorHandling;
const {Subject} = require('../lib/schema.js');

module.exports={
    // ! if add new subject, cache should be clear manually
    readAll: () => {
        return bookshelf.transaction( async (transaction) => {
            return cache.getAsync('subjects').then(async (cacheSubjects) => {
                if (cacheSubjects) {
                    return JSON.parse(cacheSubjects);
                }
                let subject = await Subject.fetchAll({require:false});
                if (subject) {
                    cache.set('subjects', JSON.stringify(subject));
                    console.log(subject.toJSON());
                    return (subject.toJSON());
                }
                else {
                    return new Error('Subject Not Found'); 
                }
            })
        }).catch((err) => {
            return errorHandling(err);
        });
    }
};
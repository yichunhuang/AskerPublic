const bookshelf = require('../lib/bookshelf.js');
const client = require("../lib/redis.js");
const {Subject} = require('../lib/schema.js');

module.exports={
    // // Read By Id
    // readById: (id) => {
    //     return bookshelf.transaction( async (transaction) => {
    //         if (!id)
    //             return new Error('Id is required');
    //         let subject = await Subject.where({id}).fetch({require:false});
    //         if (subject) {
    //             console.log(subject.toJSON());

    //             return (subject.toJSON());
    //         }
    //         else {
    //             return new Error('Subject Not Found'); 
    //         }
    //     }).catch((err) => {
    //         return new Error(err);
    //     });
    // },
    // Read All
    // ! if add new subject, cache should be clear manually
    readAll: (id) => {
        return bookshelf.transaction( async (transaction) => {
            return client.getAsync('subjects').then(async (cacheSubjects) => {
                if (cacheSubjects) {
                    return JSON.parse(cacheSubjects);
                }
                else {
                    let subject = await Subject.fetchAll({require:false});
                    if (subject) {
                        client.set('subjects', JSON.stringify(subject));
                        return (subject.toJSON());
                    }
                    else {
                        return new Error('Subject Not Found'); 
                    }
                }
            })
        }).catch((err) => {
            return new Error(err);
        });
    }
};
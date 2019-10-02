const bookshelf = require('../lib/bookshelf.js');
const base64Img = require('base64-img');
const {ChatRecord} = require('../lib/schema.js');

module.exports={
    new: (recordData) => {
        return bookshelf.transaction( async (transaction) => {
            let recordArr = [];
            for (let i = 0 ; i < recordData.length; i++) {
                let record = await ChatRecord.forge(recordData[i]).save();
                recordArr[i] = record.toJSON();
                if (i === recordData.length-1) {
                    return recordArr; 
                }
            }
        }).catch((err) => {
            return new Error(err);
        });
    },
    readAll: (recordData) => {
        return bookshelf.transaction( async (transaction) => {
            let record = await ChatRecord.where(recordData).fetchAll({require:false});
            return (record) ? record.toJSON() : new Error('Post Not Found');
        }).catch((err) => {
            return new Error(err);
        });
    }
};
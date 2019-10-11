const bookshelf = require('../lib/bookshelf.js');
const mailer = require('../lib/mailer.js');
const validateUser = require("../lib/validation.js");
const errorHandling = require("../lib/errorHandling.js").errorHandling;
const {User, TeacherOrder} = require('../lib/schema.js');


module.exports={
    readAll: (accessToken) => {
        return bookshelf.transaction( async (transaction) => {
            let user = await validateUser(accessToken);
            if (!user || user.toJSON().role != 'teacher')
                return new Error('Token Invalid'); 
            let orders = await TeacherOrder.where({teacherId: user.id}).fetchAll({
                withRelated: ['teacher'], require:false});
            if (orders) {
                return (orders.toJSON());
            }
            else {
                return new Error('Student Not Yet Has Order'); 
            }
        }).catch((err) => {
            return errorHandling(err);
        });
    }
};

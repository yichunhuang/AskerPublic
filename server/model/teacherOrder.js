const bookshelf = require('../lib/bookshelf.js');
const mailer = require('../lib/mailer.js');
const client = require("../lib/redis.js");
const User = bookshelf.Model.extend({
    tableName: 'user'
});
const TeacherOrder = bookshelf.Model.extend({
    tableName: 'teacherOrder',
    teacher: function() {
        return this.belongsTo(User, 'teacherId');
    }
});


module.exports={
    // Read All with accessToken
    
    readAll: (accessToken) => {
        return bookshelf.transaction( async (transaction) => {
            // return client.getAsync(accessToken).then(async (user) => {
            //     if (!user || JSON.parse(user).role != 'teacher') 
            //         return new Error('Token Invalid');
            //     user = JSON.parse(user);
                    
                let user = await User.where({accessToken}).andWhere('accessExpired', '>', Date.now()).fetch({require:false});
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
            // }).catch((err) => {
            //     return new Error(err); 
            // })
        }).catch((err) => {
            return new Error(err);
        });
    }
};
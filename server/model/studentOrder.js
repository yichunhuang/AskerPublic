const bookshelf = require('../lib/bookshelf.js');;
const mailer = require('../lib/mailer.js');
const client = require("../lib/redis.js");
const User = bookshelf.Model.extend({
    tableName: 'user'
});
const StudentOrder = bookshelf.Model.extend({
    tableName: 'studentOrder',
    student: function() {
        return this.belongsTo(User, 'studentId');
    }
});


module.exports={
    // Add StudentOrder
    new: (orderData) => {
        let {tokenId, accessToken, total, recipientEmail} = orderData;
        if (!tokenId || !accessToken || !total || !recipientEmail) {
            return new Error('Request Error: Input should not be blank.');
        }
        return bookshelf.transaction( async (transaction) => {
            let student = await User.where({accessToken}).andWhere('accessExpired', '>', Date.now()).fetch({require:false});
            if (!student)
                return new Error('Token Invalid');
            const stripe = require('stripe')('sk_test_I8K4XyvOpmkpQel9gxdzHFTG00lWX0iEVf');
            return (async () => {
                const charge = await stripe.charges.create({
                    amount: total * 100,
                    currency: 'usd',
                    description: 'Test charge',
                    source: tokenId
                });
                client.hdel('studentOrder', student.id);
                let order = await StudentOrder.forge({studentId: student.id, total, status: 'paid', recipientEmail, payment: JSON.stringify(charge), createdAt: Date().toString()}, {transacting: transaction}).save();
                let {options, transporter} = mailer;
                options.to = recipientEmail;
                transporter.sendMail(options, (error, info) =>{
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
                // add points
                await student.set({point: student.toJSON().point+total}, {transacting: transaction}).save();
                return (order.toJSON());
            })().catch((err) => {
                if (err.raw) { // payment fail
                    return StudentOrder.forge({studentId: student.id, total, status: 'unpaid', recipientEmail, payment: JSON.stringify(err.raw), createdAt: Date().toString()}, {transacting: transaction}).save()
                    .then((order) => {return order.toJSON()});
                }
                else {
                    return new Error(err);
                }
            });
        }).catch((err) => {
            return new Error(err);
        }); 
    },
    // Read All with accessToken
    readAll: (accessToken) => {
        return bookshelf.transaction( async (transaction) => {
            // return client.getAsync(accessToken).then(async (user) => {
            //     if (!user || JSON.parse(user).role != 'student') 
            //         return new Error('Token Invalid');
            //     user = JSON.parse(user);
                let user = await User.where({accessToken}).andWhere('accessExpired', '>', Date.now()).fetch({require:false});
                if (!user || user.toJSON().role != 'student')
                    return new Error('Token Invalid'); 
                return client.hgetAsync('studentOrder', user.id).then(async (cacheStudentOrder) => {
                    if (cacheStudentOrder) {
                        return JSON.parse(cacheStudentOrder);
                    }
                    else {
                        let orders = await StudentOrder.where({studentId: user.id}).fetchAll({
                            withRelated: ['student'], require:false});
                        if (orders) {
                            client.hset('studentOrder', user.id, JSON.stringify(orders));
                            return (orders.toJSON());
                        }
                        else {
                            return new Error('Student Not Yet Has Order'); 
                        }
                    }
                });
            // }).catch((err) => {
            //     return new Error(err); 
            // })
        }).catch((err) => {
            return new Error(err);
        });
    }
};
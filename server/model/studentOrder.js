require('dotenv').config();
const bookshelf = require('../lib/bookshelf.js');
const validateUser = require("../lib/validation.js");
const mailer = require('../lib/mailer.js');
const cache = require("../lib/redis.js");
const errorHandling = require("../lib/errorHandling.js").errorHandling;
const {User, StudentOrder} = require('../lib/schema.js');

module.exports={
    new: (orderData) => {
        let {tokenId, accessToken, total, recipientEmail} = orderData;
        if (!tokenId || !accessToken || !total || !recipientEmail) {
            return new Error('Request Error: Input should not be blank.');
        }
        return bookshelf.transaction( async (transaction) => {
            let student = await validateUser(accessToken);
            if (!student)
                return new Error('Token Invalid');
            
            return stripePayment(total, tokenId).then(async (charge) => {
                cache.hdel('studentOrder', student.id);
                let order = await StudentOrder.forge({studentId: student.id, total, status: 'paid', recipientEmail, payment: JSON.stringify(charge), createdAt: Date().toString()}, {transacting: transaction}).save();
                sendEmailTo(recipientEmail);
                await student.set({point: student.toJSON().point+total}, {transacting: transaction}).save();
                return (order.toJSON());
            }).catch((err) => {
                if (err.raw) { // payment fail
                    return StudentOrder.forge({studentId: student.id, total, status: 'unpaid', recipientEmail, payment: JSON.stringify(err.raw), createdAt: Date().toString()}, {transacting: transaction}).save()
                    .then((order) => {return order.toJSON()});
                }
                return errorHandling(err);
            });
        }).catch((err) => {
            return errorHandling(err);
        }); 
    },
    readAll: (accessToken) => {
        return bookshelf.transaction( async (transaction) => {
            let user = await validateUser(accessToken);
            if (!user || user.toJSON().role != 'student')
                return new Error('Token Invalid'); 
            return cache.hgetAsync('studentOrder', user.id).then(async (cacheStudentOrder) => {
                if (cacheStudentOrder) 
                    return JSON.parse(cacheStudentOrder);
                let orders = await StudentOrder.where({studentId: user.id}).fetchAll({
                    withRelated: ['student'], require:false});
                if (orders) {
                    cache.hset('studentOrder', user.id, JSON.stringify(orders));
                    return (orders.toJSON());
                }
                else {
                    return new Error('Student Not Yet Has Order'); 
                }
            });
        }).catch((err) => {
            return errorHandling(err);
        });
    }
};

let stripePayment = async (total, tokenId) => {
    const stripe = require('stripe')(process.env["STRIPE_KEY"]);
    const charge = await stripe.charges.create({
        amount: total * 100,
        currency: 'usd',
        description: 'Customer Point Purchase',
        source: tokenId
    });
    return charge;
}
let sendEmailTo = (recipientEmail) => {
    let {options, transporter} = mailer;
    options.to = recipientEmail;
    transporter.sendMail(options, (error, info) =>{
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    }); 
}
const bookshelf = require('../lib/bookshelf.js');
const validateUser = require("../lib/validation.js");
const errorHandling = require("../lib/errorHandling.js").errorHandling;
const {User, TeacherSubscription} = require('../lib/schema.js');

module.exports={
    update: (subscriptionData) => {
        let {endpoint, expirationTime, p256dh, auth, subjectIds, accessToken} = subscriptionData;
        if (!endpoint || !expirationTime || !p256dh || !auth || !subjectIds || !accessToken) {
            return new Error('Request Error: Input should not be blank.');
        }
        
        return bookshelf.transaction(async (transaction) => {
            let teacher = await validateUser(accessToken);
            if (!teacher)
                return new Error('Token Invalid');
            let subscription = {endpoint, expirationTime, keys: {p256dh, auth}};
            let subscriptionJSON = JSON.stringify(subscription);
            let teacherUpdated = await teacher.set({subscription: subscriptionJSON}, {transacting: transaction}).save();
            await TeacherSubscription.where({teacherId: teacherUpdated.id}, {transacting: transaction}).destroy({require:false});
            subjectIds.forEach(async (subjectId) => {
                await TeacherSubscription.forge({teacherId: teacher.id, subjectId}, {transacting: transaction}).save();
            });
            return ('Subscription Updated');
        }).catch((err) => {
            return errorHandling(err);
        });
    },
};


const bookshelf = require('../lib/bookshelf.js');
const {User, TeacherSubscription} = require('../lib/schema.js');

module.exports={
    // Update Subscription
    update: (subscriptionData) => {
        let {endpoint, expirationTime, p256dh, auth, subjectIds, accessToken} = subscriptionData;
        if (!endpoint || !expirationTime || !p256dh || !auth || !subjectIds || !accessToken) {
            return new Error('Request Error: Input should not be blank.');
        }
        
        return bookshelf.transaction(async (transaction) => {
            let teacher = await User.where({accessToken}).andWhere('accessExpired', '>', Date.now()).fetch({require:false});
            if (!teacher)
                return new Error('Token Invalid');
            let subscription = {endpoint, expirationTime, keys: {p256dh, auth}};
            subscription = JSON.stringify(subscription);
            teacher = await teacher.set({subscription}, {transacting: transaction}).save();
            await TeacherSubscription.where({teacherId: teacher.id}, {transacting: transaction}).destroy({require:false});
            subjectIds.forEach(async (subjectId) => {
                await TeacherSubscription.forge({teacherId: teacher.id, subjectId}, {transacting: transaction}).save();
            });
            return ('Subscription Updated');
        }).catch((err) => {
            return new Error(err);
        });
    },
};
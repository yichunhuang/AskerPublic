const webpush = require('web-push');
const MySQLEvents = require('@rodrigogs/mysql-events');
const {TeacherSubscription} = require('./lib/schema.js')
const path = require('path');
const publicVapidKey = process.env["PUBLIC_VAPID_KEY"];
const privateVapidKey = process.env["PRIVATE_VAPID_KEY"];

webpush.setVapidDetails(
    'mailto:b03704074@ntu.edu.tw', 
    publicVapidKey, 
    privateVapidKey
);

module.exports = {
    init: () => {
       (async () => {
            const postEvent = new MySQLEvents(
                {
                    host:               '127.0.0.1',
                    port:               3306,
                    user:               process.env["DB_USER"],
                    password:           process.env["DB_PASSWORD"]
                }, 
                {
                    startAtEnd: true,serverId: 2,
                }
            );
        
            await postEvent.start();

            postEvent.addTrigger(
                {
                    name: 'New Post',
                    expression: process.env["DB_DATABASE"] + '.post',
                    statement: MySQLEvents.STATEMENTS.INSERT,
                    onEvent: async (event) => {
                        let subjectIdOfPost = event.affectedRows[0].after.subjectId;
                        let teacherSubscription = await TeacherSubscription.where({subjectId: subjectIdOfPost}).fetchAll({withRelated: ['teacher', 'subject'], require:false});
                        let teacherSubscriptionJSON = teacherSubscription.toJSON(); 
                        for (let i = 0; i < teacherSubscriptionJSON.length; i++) {
                            let subscription = getSubscription(teacherSubscriptionJSON[i]);
                            let payload = getPayload(teacherSubscriptionJSON[i]);
                            webpush.sendNotification(subscription, payload).catch(err => console.error(err));
                        }
                    },
                }
            );
        
            postEvent.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
            postEvent.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
        })()
        .then(() => console.log('Waiting for database events...'))
        .catch(console.error);
    }
}


let getSubscription = (teacherSubscriptionJSON) => JSON.parse(teacherSubscriptionJSON.teacher.subscription); 

let getPayload = (teacherSubscriptionJSON) => {
    let teacherName = teacherSubscriptionJSON.teacher.name;
    let title = teacherName + '! Check This Out!'; 
    let body = 'New Question on Subject: ' + teacherSubscriptionJSON.subject.name; 
    return payload = JSON.stringify({title, body}); 
}

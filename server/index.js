const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/mySchema.js');
const bodyParser=require('body-parser');
const siofu = require('socketio-file-upload');
const client = require("./lib/redis.js");
const fs=require('fs');
let s3 = require("./lib/s3.js");
const bookshelf = require('./lib/bookshelf.js');
const Post = require('./model/post.js');
const User = require('./model/user.js');
const ChatRecord = require('./model/chatRecord.js');
const app = express();
const server = app.listen(3000,  () => {
    console.log('now listening for requests on port 3000');
});
const io = require('socket.io').listen(server);
require('dotenv').config();
app.use(express.static('/')); 
app.use(express.static('frontend')); 
app.use('/assets', express.static('assets')); 
app.use(siofu.router);
app.use(bodyParser.json({limit: '10mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
// bind express with graphql
app.use('/graphql', 
    graphqlHTTP({
        schema,
        graphiql: true
    })
);

// Subscription
const webpush = require('web-push');
const path = require('path');
const publicVapidKey = process.env["PUBLIC_VAPID_KEY"];
const privateVapidKey = process.env["PRIVATE_VAPID_KEY"];

webpush.setVapidDetails(
    'mailto:b03704074@ntu.edu.tw', 
    publicVapidKey, 
    privateVapidKey
);

const UserDB = bookshelf.Model.extend({
    tableName: 'user'
});
const SubjectDB = bookshelf.Model.extend({
    tableName: 'subject'
});
const TeacherSubscription = bookshelf.Model.extend({
    tableName: 'teacherSubscription',
    teacher: function() {
        return this.belongsTo(UserDB, 'teacherId');
    },
    subject: function() {
        return this.belongsTo(SubjectDB, 'subjectId');
    }
});
const MySQLEvents = require('@rodrigogs/mysql-events');
let hasNewPost = false;
let subjectIdOfPost = "";
const program = async () => {
	const instance = new MySQLEvents({
        host:               '127.0.0.1',
        port:               3306,
        user:               process.env["DB_USER"],
        password:           process.env["DB_PASSWORD"]
	}, {
	  startAtEnd: true,serverId: 2,
	});
  
	await instance.start();

	instance.addTrigger({
	  name: 'New Post',
      expression: process.env["DB_DATABASE"] + '.post',
	  statement: MySQLEvents.STATEMENTS.INSERT,
	  onEvent: async (event) => {
        hasNewPost = true;
        subjectIdOfPost = event.affectedRows[0].after.subjectId;
        let teacherSubscription = await TeacherSubscription.where({subjectId: subjectIdOfPost}).fetchAll({
            withRelated: ['teacher', 'subject'], require:false});
        teacherSubscription = teacherSubscription.toJSON(); 
        for (let i = 0; i < teacherSubscription.length; i++) {
            let subscription = JSON.parse(teacherSubscription[i].teacher.subscription);
            let teacherName = teacherSubscription[i].teacher.name;
            let title = teacherName + '! Check This Out!'; 
            let body = 'New Question on Subject: ' + teacherSubscription[i].subject.name; 
            let payload = JSON.stringify({title, body});
            webpush.sendNotification(subscription, payload).catch(err => console.error(err));
        }
	  },
	});
  
	instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
	instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
  };
  
program()
.then(() => console.log('Waiting for database events...'))
.catch(console.error);


// Socket.io
io.set('origins', '*:*');
io.on('connection', (socket) => {
    console.log("io connect");
    
    let uploader = new siofu();
    uploader.listen(socket);
    uploader.on("saved", function(event){
        fs.readFile(event.file.pathName, (err, data) => {
            if (err) throw err;
            console.log(data);
            const params = {
                Bucket: 'stylishbucket',
                Key: 'assets/socket/' + post.id + '/' + event.file.name,
                Body: data,
                ACL: 'public-read',
                ContentEncoding: 'base64', // required
                ContentType: `image/png`
            }
            s3.upload(params, (err, data) => {
                if (err) { return new Error(err) }
                
                // Continue if no error
                // Save data.Location in your database
                console.log('Image successfully uploaded.');

                // console.log(event);
                let msg = {};
                msg.msgType = 'img';
                msg.msg = 'assets/socket/' + post.id + '/' + event.file.name; 
                msg.postId = post.id;
                msg.senderId = user.id;
                msg.createdAt = Date.now();
                client.hset(post.id, JSON.stringify(msg), "value");
                io.to(post.id).emit("msg", msg);

                fs.unlink(event.file.pathName, (err) => {
                    if (err) throw err;
                    console.log(event.file.pathName + ' was deleted');
                });
            });
        });
    });

	let accessToken = socket.handshake.query.token;
    let postId = socket.handshake.query.postId;
    let post;
    let user;
	socket.on("init" , () => {
		if (!accessToken) {
			socket.emit('status', 'authentication error');
            socket.disconnect();
			return;
        };
        if (!postId) {
            socket.emit('status', 'postId is required');
            socket.disconnect();
            return;
        };

        let p1 = Post.readById(postId);
        let p2 = User.readByToken(accessToken); 
        Promise.all([p1, p2]).then((values) => {
            post = values[0];
            user = values[1];
            
            // TODO: to be refract too much repeat!
            if ((user.role === 'student' && post.studentId === user.id) ||
            (user.role === 'teacher' && post.status === 'Answering' && post.teacherId === user.id)) {
                ChatRecord.readAll({postId: post.id}).then((chatRecord) => {
                    socket.join(post.id);
                    socket.emit("status", 'init ok');
                    socket.emit("userId", user.id);
                    socket.emit("chatRecord", chatRecord); 
                    io.to(post.id).emit("online", io.nsps['/'].adapter.rooms[post.id].length);
                    fs.mkdir("/Users/yichun_huang/Desktop/AWS/GraphQLPractice/server/assets/socket/"+post.id, { recursive: true }, (err) => {
                        if (err) {
                            socket.emit('status', 'File Dir Invalid');
                            socket.disconnect();
                            return; 
                        } 
                    });
                    uploader.dir = "/Users/yichun_huang/Desktop/AWS/GraphQLPractice/server/assets/socket/" + post.id;
                    // let clients = io.nsps['/'].adapter.rooms[post.id];
                    // console.log(clients.length);
                })
            }
            else if (user.role === 'teacher' && post.status === 'Unanswer') {
               let p1 = Post.update({id: post.id, teacherId: user.id, status: 'Answering'});
               let p2 = ChatRecord.readAll({postId: post.id});
               Promise.all([p1, p2]).then((values) => {
                    socket.join(post.id);
                    socket.emit("status", 'init ok');
                    socket.emit("userId", user.id);
                    socket.emit("chatRecord", chatRecord); 
                    io.to(post.id).emit("online", io.nsps['/'].adapter.rooms[post.id].length);
                    fs.mkdir("/Users/yichun_huang/Desktop/AWS/GraphQLPractice/server/assets/socket/"+post.id, { recursive: true }, (err) => {
                        if (err) {
                            socket.emit('status', 'File Dir Invalid');
                            socket.disconnect();
                            return; 
                        } 
                    });
                    uploader.dir = "/Users/yichun_huang/Desktop/AWS/GraphQLPractice/server/assets/socket/" + post.id;
               })
            }
            else {
                socket.emit('status', 'Data Invalid');
                socket.disconnect();
                return; 
            }

        }); 
	});

	// cache
	socket.on("send", (msg) => {
        msg.postId = post.id;
        msg.senderId = user.id;
        msg.createdAt = Date.now();
        console.log(msg);
		client.hset(post.id, JSON.stringify(msg), "value");
		io.to(post.id).emit("msg", msg);
	});
    
    socket.on("draw", function (info) {
        io.to(post.id).emit("draw", info);
    });
    
    socket.on("reset", function(){
       socket.to(post.id).emit("reset");
    });

	// store into db, clear cache
	socket.on('disconnect', () => {
		console.log("someone disconnect");
		if (!post || !post.id)
		    return;
		client.hkeys(post.id, function (err, values) {
			if (!values.length)
                return;
            
			for (let i = 0; i < values.length; i++)
                values[i] = (JSON.parse(values[i]));
            values.sort((a, b) => a.createdAt - b.createdAt);
            console.log(values);
            ChatRecord.new(values).then((data) => {
                console.log('data: ');
                console.log(data);
                client.del(post.id);
            })
        });
        if (io.nsps['/'].adapter.rooms[post.id])
            io.to(post.id).emit("online", io.nsps['/'].adapter.rooms[post.id].length-1);
        socket.leave(post.id);
    });

    socket.on('studentLeave', () => {
        socket.to(post.id).emit("studentLeave");
    });
    socket.on('teacherLeave', () => {
        socket.to(post.id).emit("teacherLeave");
    });
});


const fs=require('fs');
const cache = require("./lib/redis.js");
const s3 = require("./lib/s3.js");
const Post = require('./model/post.js');
const User = require('./model/user.js');
const ChatRecord = require('./model/chatRecord.js');
module.exports = (io, siofu) => {
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
                    ContentEncoding: 'base64', 
                    ContentType: `image/png`
                }
                s3.upload(params, (err, data) => {
                    if (err) { return new Error(err) }
                    console.log('Image successfully uploaded.');

                    let msg = {};
                    msg.msgType = 'img';
                    msg.msg = 'assets/socket/' + post.id + '/' + event.file.name; 
                    msg.postId = post.id;
                    msg.senderId = user.id;
                    msg.createdAt = Date.now();
                    cache.hset(post.id, JSON.stringify(msg), "value");
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

            let getPostPromise = Post.readById(postId);
            let getUserPromise = User.readByToken(accessToken); 
            Promise.all([getPostPromise, getUserPromise]).then((promises) => {
                post = promises[0];
                user = promises[1];
                
                let isStudent = (user, post) => user.role === 'student' && post.studentId === user.id; 
                let isAnsweringTeacher = (user, post) => user.role === 'teacher' && post.status === 'Answering' && post.teacherId === user.id; 
                let isNewComingTeacher = (user, post) => user.role === 'teacher' && post.status === 'Unanswer'; 

                if (!isStudent && !isAnsweringTeacher && !isNewComingTeacher) {
                    socket.emit('status', 'Data Invalid');
                    socket.disconnect();
                    return; 
                }

                let promiseArray = [];
                promiseArray.push(ChatRecord.readAll({postId: post.id}));
                if (isNewComingTeacher)
                    promiseArray.push(Post.update({id: post.id, teacherId: user.id, status: 'Answering'}));
                Promise.all(promiseArray).then((promises) => {
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
            }); 
        });

        // cache
        socket.on("send", (msg) => {
            msg.postId = post.id;
            msg.senderId = user.id;
            msg.createdAt = Date.now();
            cache.hset(post.id, JSON.stringify(msg), "value");
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
            cache.hkeys(post.id, function (err, values) {
                if (!values.length)
                    return;
                for (let i = 0; i < values.length; i++)
                    values[i] = (JSON.parse(values[i]));
                values.sort((a, b) => a.createdAt - b.createdAt);
                ChatRecord.new(values).then((data) => {
                    cache.del(post.id);
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
}

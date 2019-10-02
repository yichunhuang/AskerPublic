const fs=require('fs');
const client = require("./lib/redis.js");
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
                ChatRecord.new(values).then((data) => {
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
}

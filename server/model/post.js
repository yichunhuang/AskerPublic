const bookshelf = require('../lib/bookshelf.js');
const base64Img = require('base64-img');
const client = require("../lib/redis.js");
let s3 = require("../lib/s3.js");
const {ChatRecord, User, Subject, Post} = require('../lib/schema.js');

module.exports={
    // Add Post
    new: (postData) => {
        let {title, subjectId, content, images, accessToken} = postData;
        if (!title || !subjectId || !content || !images || !accessToken) {
            return new Error('Request Error: Input should not be blank.');
        }
        return bookshelf.transaction( async (transaction) => {
                let student = await User.where({accessToken}).andWhere('accessExpired', '>', Date.now()).fetch({require:false});
                if (!student)
                    return new Error('Token Invalid');
                student = student.toJSON();
                console.log(student.point);
                if (student.point < 10) 
                    return new Error('Point Invalid')
                let post = await Post.forge({title, subjectId, content, studentId: student.id, createdAt: Date().toString()}, {transacting: transaction}).save();

                // let filesPath = images.map((img, index) => base64Img.imgSync('data:image/png;base64,' + img, 'assets/posts/' + post.toJSON().id, index)); 
                // TODO: async return 
                let filesPath =  images.map((img, index) => {
                    let base64Arr = Buffer.from(img, 'base64');
                    const params = {
                        Bucket: 'stylishbucket',
                        Key: 'assets/posts/' + post.toJSON().id + '/' + index + '.png',
                        Body: base64Arr,
                        ACL: 'public-read',
                        ContentEncoding: 'base64', // required
                        ContentType: `image/png`
                    }
                    s3.upload(params, (err, data) => {
                        if (err) { console.log(err);return new Error(err) }
                        
                        // Continue if no error
                        // Save data.Location in your database
                        console.log('Image successfully uploaded.');
                    });
                    return params.Key;
                });
                post = await post.set({images: filesPath.toString()}, {transacting: transaction}).save();
                console.log(post.toJSON());
                return (post.toJSON());
        }).catch((err) => {
            return new Error(err);
        });
    },
    // Update Post
    update: (postData) => {
        let {id, accessToken, status} = postData;
        if (!id || !status) {
            return new Error('Request Error: Input should not be blank.');
        }
        return bookshelf.transaction( async (transaction) => {
            let post = await Post.where({id}).fetch({require:false});
            if (!post) {
                return new Error('Post ID invalid.')
            }

            // teacher enter a post
            if (status === 'Answering' && accessToken) 
            {
                let teacher = await User.where({accessToken}).andWhere('accessExpired', '>', Date.now()).fetch({require:false});
                if (!teacher)
                    return new Error('Token Invalid'); 
                post = await post.set({teacherId: teacher.id, status}, {transacting: transaction}).save();
                client.hdel('post', id);
                return (post.toJSON());
            }

            // student leave a post
            else if (status === 'Answered' && accessToken) {
                let student = await User.where({accessToken}).andWhere('accessExpired', '>', Date.now()).fetch({require:false});
                if (!student)
                    return new Error('Token Invalid'); 

                if (!post.toJSON().teacherId) {
                    // student discard the post, wont transfer points  
                    post = await post.set({status: 'Discard'}, {transacting: transaction}).save();
                }
                else {
                    await student.set({point: student.toJSON().point-10}, {transacting: transaction}).save();
                    let teacher = await User.where({id: post.toJSON().teacherId}).fetch({require:false});
                    await teacher.set({point: teacher.toJSON().point+10}, {transacting: transaction}).save(); 
                    post = await post.set({status}, {transacting: transaction}).save();
                }
                client.hdel('post', id);
                return (post.toJSON());
            }

            // teacher leave a post
            else if (status === 'Unanswer' && accessToken) {
                let teacher = await User.where({accessToken}).andWhere('accessExpired', '>', Date.now()).fetch({require:false});
                if (!teacher)
                    return new Error('Token Invalid');
                
                post = await post.set({status: 'Unanswer', teacherId: null}, {transacting: transaction}).save();
                return (post.toJSON());
            }
            else {
                return new Error('Status Invalid.')
            }
        }).catch((err) => {
            return new Error(err);
        });
    }, 
    // Read By Id
    readById: (id) => {
        return bookshelf.transaction( async (transaction) => {
            if (!id)
                return new Error('Post Not Found');
            return client.hgetAsync('post', id).then(async (cachePost) => {
                if (cachePost) {
                    return JSON.parse(cachePost);
                }
                else {
                    let post = await Post.where({id}).fetch({
                        withRelated: ['chatRecords', 'student', 'teacher', 'subject'], require:false});
                    if (post) {
                        client.hset('post', id, JSON.stringify(post));
                        return (post.toJSON());
                    }
                    else {
                        return new Error('Post Not Found'); 
                    }
                }
            });
            
            
        }).catch((err) => {
            return new Error(err);
        });
    },
    // Read All with some conditions
    readAll: (postData) => {
        let {subjectIds, accessToken, status,keyword} = postData;
        return bookshelf.transaction( async (transaction) => {
            let conditions = {};
            if (!status) {
                return new Error('Status Invalid');
            }
            else {
                conditions.status = status;
            }

            // The user himself can view his answered questions
            if (status === 'Answered' && !accessToken)
                return new Error('Token Invalid');
            if (accessToken) {
                await client.getAsync(accessToken).then(async (user) => {
                    if (!user) 
                        return new Error('Token Invalid');
                    user = JSON.parse(user);
                    if (user.role === 'student')
                        conditions.studentId = user.id;
                    else if (user.role === 'teacher')
                        conditions.teacherId = user.id;
                });
                // let user = await User.where({accessToken}).andWhere('accessExpired', '>', Date.now()).fetch({require:false});
                // if (user) {
                //     if (user.toJSON().role === 'student')
                //         conditions.studentId = user.id;
                //     else if (user.toJSON().role === 'teacher')
                //         conditions.teacherId = user.id;
                // }
                // else {
                //     return new Error('Token Invalid');
                // }
            }

            // 老師選科目
            // 老師學生選關鍵字
            let post;
            if (subjectIds && subjectIds.length) {
                post = await Post.where('subjectId', 'IN', subjectIds).andWhere(conditions).fetchAll({
                withRelated: ['chatRecords', 'student', 'teacher', 'subject'], require:false});
            }
            else if (keyword && keyword.length) {
                post = await Post.where('title', 'LIKE', '%'+keyword+'%').andWhere(conditions).fetchAll({
                withRelated: ['chatRecords', 'student', 'teacher', 'subject'], require:false});
            }
            else {
                post = await Post.where(conditions).fetchAll({
                withRelated: ['chatRecords', 'student', 'teacher', 'subject'], require:false});
            }
            if (post) {
            return (post.toJSON());
            }
            else {
                return new Error('Post Not Found'); 
            }
        }).catch((err) => {
            return new Error(err);
        });
    }
};
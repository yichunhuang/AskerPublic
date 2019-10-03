const bookshelf = require('../lib/bookshelf.js');
const base64Img = require('base64-img');
const cache = require("../lib/redis.js");
const s3 = require("../lib/s3.js");
const validateUser = require("../lib/validation.js");
const {ChatRecord, User, Subject, Post} = require('../lib/schema.js');

module.exports={
    new: (postData) => {
        let {title, subjectId, content, images, accessToken} = postData;
        if (!title || !subjectId || !content || !images || !accessToken) {
            return new Error('Request Error: Input should not be blank.');
        }
        return bookshelf.transaction( async (transaction) => {
            let student = await validateUser(accessToken);
            if (!student)
                return new Error('Token Invalid');
            let studentJSON = student.toJSON();
            if (studentJSON.point < 10) 
                return new Error('Point Invalid')
            let post = await Post.forge({title, subjectId, content, studentId: studentJSON.id, createdAt: Date().toString()}, {transacting: transaction}).save();

            // TODO: async return 
            let filesPath =  images.map((img, index) => {
                let base64Arr = Buffer.from(img, 'base64');
                const params = {
                    Bucket: 'stylishbucket',
                    Key: 'assets/posts/' + post.toJSON().id + '/' + index + '.png',
                    Body: base64Arr,
                    ACL: 'public-read',
                    ContentEncoding: 'base64',
                    ContentType: `image/png`
                }
                s3.upload(params, (err, data) => {
                    if (err) { 
                        console.log(err); 
                        return new Error(err) 
                    }
                    console.log('Image successfully uploaded.');
                });
                return params.Key;
            });
            let postWithImg = await post.set({images: filesPath.toString()}, {transacting: transaction}).save();
            return (postWithImg.toJSON());
        }).catch((err) => {
            return new Error(err);
        });
    },
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

            if (isTeacherEnterPost(status, accessToken)) 
            {
                let teacher = await validateUser(accessToken);
                if (!teacher)
                    return new Error('Token Invalid'); 
                let postUpdated = await post.set({teacherId: teacher.id, status}, {transacting: transaction}).save();
                cache.hdel('post', id);
                return (postUpdated.toJSON());
            }
            else if (isStudentLeavePost(status, accesccsToken)) {
                let student = await validateUser(accessToken);
                let postUpdated = new Object();
                if (!student)
                    return new Error('Token Invalid'); 

                if (!post.toJSON().teacherId) {
                    // student discard the post, wont transfer points  
                    postUpdated = await post.set({status: 'Discard'}, {transacting: transaction}).save();
                }
                else {
                    await student.set({point: student.toJSON().point-10}, {transacting: transaction}).save();
                    let teacher = await User.where({id: post.toJSON().teacherId}).fetch({require:false});
                    await teacher.set({point: teacher.toJSON().point+10}, {transacting: transaction}).save(); 
                    postUpdated = await post.set({status}, {transacting: transaction}).save();
                }
                cache.hdel('post', id);
                return (postUpdated.toJSON());
            }
            else if (isTeacherLeavePost(status, accessToken)) {
                let teacher = await validateUser(accessToken);
                if (!teacher)
                    return new Error('Token Invalid');
                
                let postUpdated = await post.set({status: 'Unanswer', teacherId: null}, {transacting: transaction}).save();
                return (postUpdated.toJSON());
            }
            else {
                return new Error('Status Invalid.')
            }
        }).catch((err) => {
            return new Error(err);
        });
    }, 
    readById: (id) => {
        return bookshelf.transaction( async (transaction) => {
            if (!id)
                return new Error('Post Not Found');
            return cache.hgetAsync('post', id).then(async (cachePost) => {
                if (cachePost)  
                    return JSON.parse(cachePost);
                let post = await Post.where({id}).fetch({
                    withRelated: ['chatRecords', 'student', 'teacher', 'subject'], require:false});
                if (post) {
                    cache.hset('post', id, JSON.stringify(post));
                    return (post.toJSON());
                }
                else {
                    return new Error('Post Not Found'); 
                }
            });
        }).catch((err) => {
            return new Error(err);
        });
    },
    readAll: (postData) => {
        let {subjectIds, accessToken, status,keyword} = postData;
        return bookshelf.transaction( async (transaction) => {
            let conditions = new Object();
            if (!status) 
                return new Error('Status Invalid');
            conditions.status = status;

            if (denyAccessToHistory(status, accessToken))
                return new Error('Token Invalid');
            if (accessToken) {
                await cache.getAsync(accessToken).then(async (user) => {
                    if (!user) 
                        return new Error('Token Invalid');
                    user = JSON.parse(user);
                    if (user.role === 'student')
                        conditions.studentId = user.id;
                    else if (user.role === 'teacher')
                        conditions.teacherId = user.id;
                });
            }

            let post = new Object();
            if (filterSubjects) {
                post = await Post.where('subjectId', 'IN', subjectIds).andWhere(conditions).fetchAll({
                withRelated: ['chatRecords', 'student', 'teacher', 'subject'], require:false});
            }
            else if (filterKeyword) {
                post = await Post.where('title', 'LIKE', '%'+keyword+'%').andWhere(conditions).fetchAll({
                withRelated: ['chatRecords', 'student', 'teacher', 'subject'], require:false});
            }
            else {
                post = await Post.where(conditions).fetchAll({
                withRelated: ['chatRecords', 'student', 'teacher', 'subject'], require:false});
            }
            return (post.toJSON());
        }).catch((err) => {
            return new Error(err);
        });
    }
};

let isTeacherEnterPost = (status, accessToken) => status === 'Answering' && accessToken;
let isStudentLeavePost = (status, accessToken) => status === 'Answered' && accessToken;
let isTeacherLeavePost = (status, accessToken) => status === 'Unanswer' && accessToken;
let denyAccessToHistory = (status, accessToken) => status === 'Answered' && !accessToken;
let filterSubjects = (subjectIds) => subjectIds && subjectIds.length;
let filterKeyword = (keyword) => keyword && keyword.length; 
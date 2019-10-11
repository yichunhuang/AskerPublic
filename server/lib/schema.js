const bookshelf = require('./bookshelf.js');
const User = bookshelf.Model.extend({
    tableName: 'user'
});

const ChatRecord = bookshelf.Model.extend({
    tableName: 'chatRecord'
});

const Subject = bookshelf.Model.extend({
    tableName: 'subject'
});

const Post = bookshelf.Model.extend({
    tableName: 'post',
    chatRecords: function() {
        return this.hasMany(ChatRecord, 'postId');
    },
    student: function() {
        return this.belongsTo(User, 'studentId');
    }, 
    teacher: function() {
        return this.belongsTo(User, 'teacherId');
    },
    subject: function() {
        return this.belongsTo(Subject, 'subjectId');
    }
});

const StudentOrder = bookshelf.Model.extend({
    tableName: 'studentOrder',
    student: function() {
        return this.belongsTo(User, 'studentId');
    }
});

const TeacherOrder = bookshelf.Model.extend({
    tableName: 'teacherOrder',
    teacher: function() {
        return this.belongsTo(User, 'teacherId');
    }
});

const TeacherSubscription = bookshelf.Model.extend({
    tableName: 'teacherSubscription',
    teacher: function() {
        return this.belongsTo(User, 'teacherId');
    },
    subject: function() {
        return this.belongsTo(Subject, 'subjectId');
    }
});

module.exports={
    User                :User,
    ChatRecord          :ChatRecord,
    Subject             :Subject,
    Post                :Post, 
    StudentOrder        :StudentOrder,
    TeacherOrder        :TeacherOrder,
    TeacherSubscription :TeacherSubscription
};

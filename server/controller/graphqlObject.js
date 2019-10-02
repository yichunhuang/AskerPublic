const graphql = require('graphql');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLBoolean
} = graphql;

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({ 
        id: {type: GraphQLID},
        provider: {type: GraphQLString},
        name: {type: GraphQLString},
        email: {type: GraphQLString},
        role: {type: GraphQLString},
        accessToken: {type: GraphQLString},
        accessExpired: {type: GraphQLString},
        point: {type: GraphQLInt},
        createdAt: {type: GraphQLString},
        photo: {type: GraphQLString}
    })
});

const SubjectType = new GraphQLObjectType({
    name: 'Subject',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
    })
});
const ChatRecordType = new GraphQLObjectType({
    name: 'ChatRecord',
    fields: () => ({
        id: {type: GraphQLID},
        postId: {type: GraphQLInt},
        senderId: {type: GraphQLInt},
        msgType: {type: GraphQLString},
        msg: {type: GraphQLString},
        createdAt: {type: GraphQLString}
    })
})

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: {type: GraphQLID},
        title: {type: GraphQLString},
        subject: {type: SubjectType},
        content: {type: GraphQLString},
        images: {type: GraphQLString},
        student: {type: UserType},
        teacher: {type: UserType},
        status: {type: GraphQLString},
        chatRecords: {type: new GraphQLList(ChatRecordType)},
        createdAt: {type: GraphQLString}
    })
});

const StudentOrderType  = new GraphQLObjectType({
    name: 'StudentOrder',
    fields: () => ({
        id: {type: GraphQLID},
        student: {type: UserType},
        total: {type: GraphQLInt},
        status: {type: GraphQLString},
        recipientEmail: {type: GraphQLString},
        createdAt: {type: GraphQLString}
    })
});

const TeacherOrderType = new GraphQLObjectType({
    name: 'TeacherOrder',
    fields: () => ({
        id: {type: GraphQLID},
        teacher: {type: UserType},
        total: {type: GraphQLInt},
        status: {type: GraphQLString},
        recipientEmail: {type: GraphQLString},
        createdAt: {type: GraphQLString}
    })
});
 
module.exports = ({
    UserType,
    SubjectType,
    ChatRecordType,
    PostType,
    StudentOrderType,
    TeacherOrderType 
});
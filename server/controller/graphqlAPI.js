const graphql = require('graphql');
const bookshelf = require('../lib/bookshelf.js');
const Subject = require('../model/subject.js');
const Post = require('../model/post.js');
const User = require('../model/user.js');
const StudentOrder = require('../model/studentOrder.js');
const TeacherOrder = require('../model/teacherOrder.js');
const TeacherSubscription = require('../model/teacherSubscription.js');

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
        // password: {type: GraphQLString},
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
 
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: () => ({
        post: {
            type: PostType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args){
                return Post.readById(args.id);
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            args: {
                subjectIds: {type: new GraphQLList(GraphQLInt)},
                accessToken: {type: GraphQLString}, 
                status: {type: GraphQLString},
                keyword: {type: GraphQLString}
            },
            resolve(parent, args){
                return Post.readAll(args);
            }
        },
        user: {
            type: UserType,
            args: {
                provider: {type: GraphQLString},
                email: {type: GraphQLString},
                password: {type: GraphQLString},
                accessToken: {type: GraphQLString}
            },
            resolve(parent, args){
                return User.read(args);
            }
        },
        verifyUser: {
            type: UserType,
            args: {
                accessToken: {type: GraphQLString}
            },
            resolve(parent, args){
                return User.verifyByToken(args.accessToken);
            }
        },
        userProfile: {
            type: UserType,
            args: {
                accessToken: {type: GraphQLString}
            },
            resolve(parent, args){
                return User.readByToken(args.accessToken);
            }
        }, 
        studentOrders: {
            type: new GraphQLList(StudentOrderType),
            args: {
                accessToken: {type: GraphQLString} 
            },
            resolve(parent, args){
                return StudentOrder.readAll(args.accessToken)
            }
        },
        teacherOrders: {
            type: new GraphQLList(TeacherOrderType),
            args: {
                accessToken: {type: GraphQLString}
            },
            resolve(parent, args){
                return TeacherOrder.readAll(args.accessToken);
            }
        },
        subjects: {
            type: new GraphQLList(SubjectType),
            resolve(parent, args){
                return Subject.readAll();
            }
        }
    })
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addPost: {
            type: PostType,
            args: {
                title: {type: GraphQLString},
                subjectId: {type: GraphQLInt},
                content: {type: GraphQLString},
                images: {type: new GraphQLList(GraphQLString)},
                accessToken: {type: GraphQLString}
            },
            resolve(parent, args){
                return Post.new(args);
            }
        },
        updatePost: {
            type: PostType,
            args: {
                id: {type: GraphQLID},
                accessToken: {type: GraphQLString},
                status: {type: GraphQLString}
            },
            resolve(parent, args){
                return Post.update(args);
            }
        },
        addUser: {
            type: UserType,
            args: {
                provider: {type: GraphQLString},
                name: {type: GraphQLString},
                email: {type: GraphQLString},
                password: {type: GraphQLString},
                role: {type: GraphQLString}
            },
            resolve(parent, args){
                return User.new(args);
            } 
        },
        addStudentOrder: {
            type: StudentOrderType,
            args: {
                tokenId: {type: GraphQLString},
                total: {type: GraphQLInt},
                recipientEmail: {type: GraphQLString},
                accessToken: {type: GraphQLString}
            },
            resolve(parent, args) {
                return StudentOrder.new(args);
            }
        },
        addTeacherSubscription: {
            type: GraphQLString,
            args: {
                accessToken: {type: GraphQLString},
                subjectIds: {type: new GraphQLList(GraphQLInt)},
                endpoint: {type: GraphQLString},
                expirationTime: {type: GraphQLString},
                p256dh: {type: GraphQLString},
                auth: {type: GraphQLString}
            },
            resolve(parent, args) {
                return TeacherSubscription.update(args);
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});
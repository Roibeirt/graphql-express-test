const express = require('express')
const { graphqlHTTP } = require("express-graphql");
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList
} = require('graphql');

const users = [
	{ id: 1, name: 'Test1'},
	{ id: 2, name: 'Test2'},
	{ id: 3, name: 'Test3', bookmarkURL: ["TestURL1","TestURL2","TestURL3"]}
];

const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'This represents a user',
    fields: () =>({
        id: { type: (GraphQLInt)},
        name: { type: (GraphQLString)},
        bookmarkURL: { type: new GraphQLList(GraphQLString)}
    })
})

const RootQueryType = new GraphQLObjectType({
    name:'Query',
    description:'Root Query',
    fields: () => ({
        users:{
            type: new GraphQLList(UserType),
            description: 'List of all users',
            resolve: () => users
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addUser:{
            type: UserType,
            description: 'Add a user',
            args: {
                id:{type: GraphQLInt},
                name:{type: GraphQLString}
            },
            resolve: (parent, args) => {
                const user = {id: users.length+1, name: args.name};
                users.push(user);
                return user;
            }
        },
        addBookmark:{
            type: GraphQLString,
            description: 'Add bookmark to user',
            args: {
                userID:{type: GraphQLInt},
                newBookmarkURL:{type: GraphQLString}
            },
            resolve: (parent, args) =>{
                const user = users.find(user => user.id === args.userID);
                if(user.bookmarkURL == null){
                    user.bookmarkURL = [args.newBookmarkURL];
                }
                else if(user.bookmarkURL.find(bookmark => bookmark === args.newBookmarkURL)){
                    console.log("Duplicate Entry");
                }
                else{
                user.bookmarkURL.push(args.newBookmarkURL);
                }
            }
        },
        deleteBookmark:{
            type: GraphQLString,
            description: "Delete bookmark from user",
            args: {
                userID:{type: GraphQLInt},
                toDeleteURL:{type: GraphQLString}
            },
            resolve: (parent, args) =>{
                const user = users.find(user => user.id === args.userID);
                if(user.bookmarkURL == null){
                    console.log("User bookmarks not initialized");
                    return;
                }
                else bookmarkIndex = user.bookmarkURL.findIndex(bookmark => args.toDeleteURL === bookmark);
                
                if(bookmarkIndex < 0){
                    console.log("Bookmark does not exist");
                }
                else user.bookmarkURL.splice(bookmarkIndex,1);
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});

const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));
app.listen(process.env.PORT || 5000);
//CALL MODULES AND METHODS
require('dotenv').config({ path: 'variables.env' });
const { ApolloServer } = require('apollo-server');
const jwt = require('jsonwebtoken');

//IMPORTING CSS CLASSES, METHODS AND FUNCTIONS
const typeDefs = require('./graphQL/schema');
const resolvers = require('./graphQL/resolvers');

//IMPORTING CONNECTION TO DB
const connectDB = require('./db/db');

//CONNECTION TO DB
connectDB();

//CREATING SERVER
const server = new ApolloServer({ typeDefs, resolvers, context: ({ req }) => {
    const token = req.headers['authorization'] || '';

    if(token) {
        try {
            const user = jwt.verify(token.replace('Bearer ', ''), process.env.SECRET_KEY);
            return {
                user
            };
        } catch(err) {
            console.log(err);
        }
    }
} });

//SERVER RUNNING
server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`Server ready using following URL ${url}`)
})
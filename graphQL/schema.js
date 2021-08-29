//CALL MODULES AND METHOS
const { gql } = require('apollo-server');

//SCHEMA
const typeDefs = gql`
    type User {
        id: ID
        name: String
        lastName: String
        email: String
        created: String
    }

    type Token {
        token: String
    }

    type Product {
        id: ID
        name: String
        exist: Int
        price: Float
        created: String
    }

    type Client {
        id: ID
        name: String
        lastName: String
        companyName: String
        email: String
        phone: String
        created: String
        seller: ID
    }

    type groupOrder {
        id: ID
        amount: Int
        name: String
        price: Float
    }

    type Order {
        id: ID
        order: [groupOrder]
        total: Float
        client: Client
        seller: ID
        state: stateOrder
        created: String
    }

    type TopClient {
        total: Float
        clients: [Client]
    }

    type TopSeller {
        total: Float
        sellers: [User]
    }

    input UserInput {
        name: String!
        lastName: String!
        email: String!
        password: String!
    }

    input authenticateInput {
        email: String!
        password: String!
    }

    input productInput {
        name: String!
        exist: Int!
        price: Float!
    }

    input clientInput {
        name: String!
        lastName: String!
        companyName: String!
        email: String!
        phone: String
    }

    input orderProductInput {
        id: ID
        amount: Int
        name: String
        price: Float
    }

    input orderInput {
        order: [orderProductInput]
        total: Float
        client: ID!
        state: stateOrder
    }

    enum stateOrder {
        PENDING
        COMPLETED
        CANCELED
    }

    type Query {
        #USERS
        getUser: User #getUser(token: String!): User antes la funcion era asi porque pasaba el token manualmente

        #PRODUCTS
        getProducts: [Product]
        getProduct(id: ID!): Product

        #CLIENTS
        getClients: [Client]
        getClientsSeller: [Client]
        getClient(id: ID!): Client

        #ORDERS
        getOrders: [Order]
        getOrdersSeller: [Order]
        getOrder(id: ID!): Order
        getOrderState(state: String!): [Order]

        #ADVANCED SEARCHS
        betterClients: [TopClient]
        betterSellers: [TopSeller]
        searchProduct(text: String!): [Product]
    }

    type Mutation {
        #USERS
        newUser(input: UserInput): User
        authenticateUser(input: authenticateInput): Token

        #PRODUCTS
        newProduct(input: productInput): Product
        updateProduct(id: ID!, input: productInput): Product
        deleteProduct(id: ID!): String

        #CLIENTS
        newClient(input: clientInput): Client
        updateClient(id: ID!, input: clientInput): Client
        deleteClient(id: ID!): String

        #ORDERS
        newOrder(input: orderInput): Order
        updateOrder(id: ID!, input: orderInput): Order
        deleteOrder(id: ID!): String
    }
`;

//EXPORTING THE SCHEMAS
module.exports = typeDefs;
//CALL MODULES AND METHODS
require('dotenv').config({ path: 'variables.env' });
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//IMPORTING MODELS
const Users = require('../models/Users-model');
const Products = require('../models/Products-model');
const Clients = require('../models/Clients-model');
const Orders = require('../models/Orders-model');

//FUNCTIONS AND METHODS
const createToken = (user, secretWord, expiresIn) => {
    const {id, email, name, lastName} = user;
    return jwt.sign({ id, email, name, lastName }, secretWord, { expiresIn });
};

//RESOLVERS
const resolvers = {
    Query: {
        getUser: async (_, {}, ctx) => { //iba entre llaves {token} ya que lo pasaba por apollo playground
            // const userId = await jwt.verify(token, process.env.SECRET_KEY);

            // return userId;

            //Debido a que al usuario ya lo estoy pasando por ctx ya que estoy pasando el token entonces eso devuelvo
            return ctx.user; //to bring the user
        },

        getProducts: async () => {
            try {
                const products = await Products.find({});
                return products;
            } catch(err) {
                console.log(err);
            }
        },

        getProduct: async (_, { id }) => {
            //Check product exits
            const product = await Products.findById(id);

            if(!product) {
                throw new Error('Product not Found!');
            }

            return product;
        },

        getClients: async () => {
            try {
                const clients = await Clients.find({});
                return clients;
            } catch(err) {
                console.log(err);
            }
        },

        getClientsSeller: async (_, {}, ctx) => {
            try {
                const clients = await Clients.find({ seller: ctx.user.id.toString() });
                return clients;
            } catch(err) {
                console.log(err);
            }
        },

        getClient: async (_, { id }, ctx) => {
            //Check if client is already registered
            const client = await Clients.findById(id);

            if(!client) {
                throw new Error('Client not Found!');
            }

            //The one who created is the one who can see the client
            if(client.seller.toString() !== ctx.user.id) {
                throw new Error('Not Authorized to see this Client!');
            }

            return client;
        },

        getOrders: async () => {
            try {
                const orders = await Orders.find({});
                return orders;
            } catch(err) {
                console.log(err);
            }
        },

        getOrdersSeller: async (_, {}, ctx) => {
            try {
                const orders = await Orders.find({ seller: ctx.user.id }).populate('client'); //use populate method to be able to get the info of client just having its id from order
                return orders;
            } catch(err) {
                console.log(err);
            }
        },

        getOrder: async (_, { id }, ctx) => {
            //Check if the order exist
            const order = await Orders.findById(id);

            if(!order) {
                throw new Error('Order was not Found!');
            }

            //The one who created is the one who can see the order
            if(order.seller.toString() !== ctx.user.id) {
                throw new Error('Not Authorized to see this Order!');
            }

            //Returning the order
            return order;
        },

        getOrderState: async (_, { state }, ctx) => {
            const orders = await Orders.find({ seller: ctx.user.id, state });
            return orders;
        },

        betterClients: async () => {
            const clients = await Orders.aggregate([ //si veo el $ usadno en mongoose es porque es codigo de mongodb
                { $match: { state: 'COMPLETED' } }, //como si fuera un filtro en mongodb
                { $group: {
                    _id: '$client', //el id que viene de client en el pedido u order
                    total: { $sum: '$total' }
                } },
                { $lookup: {
                    from: 'clients', //de mi modelo
                    localField: '_id',
                    foreignField: '_id',
                    as: 'clients' //lo que puse en mi type del schema
                } },
                { $limit: 10 }, //limita el numero de los 10 primeros
                { $sort: { total: -1 } }
            ]); //funcion aggreate te permite hacer varias operaciones como sumar los totales de pedido en completado y te lo devuelve en un solo cliente

            return clients;
        },

        betterSellers: async () => {
            const sellers = await Orders.aggregate([
                { $match: { state: 'COMPLETED' } },
                { $group: {
                    _id: '$seller',
                    total: { $sum: '$total' }
                } },
                { $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'sellers'
                } },
                { $limit: 3 },
                { $sort: { total: -1 } }
            ]);

            return sellers;
        },

        searchProduct: async (_, { text }) => {
            const products = await Products.find({ $text: { $search: text} }).limit(10);

            return products;
        }
    },

    Mutation: {
        newUser: async (_, { input }) => {
            const { email, password } = input;

            //Check the user is not already registered
            const userExist = await Users.findOne({ email });
            if(userExist) {
                throw new Error('User already registered!');
            };

            //Hash password
            const salt = await bcrypt.genSalt(10);
            input.password = await bcrypt.hash(password, salt);

            try {
                //Save into DB
                const user = new Users(input);
                await user.save(); //Save it to DB
                return user;
            } catch(err) {
                console.log(err);
            };
        },

        authenticateUser: async (_, {input}) => {
            const { email, password} = input;

            //If ser exist
            const userExist = await Users.findOne({ email });
            if(!userExist) { //if user does not exit
                throw new Error('User does not Exist');
            };

            //Check if password is correct
            const passwordCorrect = await bcrypt.compare(password, userExist.password);
            if(!passwordCorrect) {
                throw new Error('Password is not Correct');
            }

            //Create token
            return {
                token: createToken(userExist, process.env.SECRET_KEY, '24h')
            }
        },

        newProduct: async (_, { input }) => {
            try {
                const newProduct = new Products(input);

                //Save into DB}
                const result = await newProduct.save();

                return result;
            } catch(err) {
                console.log(err);
            }
        },

        updateProduct: async (_, { id, input }) => {
            //Check if the product exist
            let product = await Products.findById(id);

            if(!product) {
                throw new Error('Product not Found!');
            }

            //Save into DB
            product = await Products.findOneAndUpdate({ _id: id}, input, { new: true });

            return product;
        },

        deleteProduct: async (_, { id }) => {
            //Check if the product exist
            let product = await Products.findById(id);

            if(!product) {
                throw new Error('Product not Found!');
            }

            //If you find the product DELETE it
            await Products.findOneAndDelete({_id: id});

            return 'Product Deleted!';
        },

        newClient: async (_, { input }, ctx) => {
            const { email } = input;

            //Check if the client is already registered
            const clientExist = await Clients.findOne({ email });

            if(clientExist) {
                throw new Error('Client already Registered!');
            };

            const newClient = new Clients(input); //Creating new client

            //Assign a seller
            newClient.seller = ctx.user.id;

            //Save client into the DB
            try {
                const client = await newClient.save();
                return client;
            } catch(err) {
                console.log(err);
            }
        },

        updateClient: async (_, { id, input }, ctx) => {
            //Check if client is registered
            let client = await Clients.findById(id);

            if(!client) {
                throw new Error('Client not Found!');
            }

            //Check if the seller is the one who is editing
            if(client.seller.toString() !== ctx.user.id) {
                throw new Error('Not Authorized to Update this Client!');
            }

            //Save client into DB
            client = await Clients.findOneAndUpdate({ _id: id }, input, { new: true });
            return client;
        },

        deleteClient: async (_, { id }, ctx) => {
            //Check if client is registered
            const client = await Clients.findById(id);

            if(!client) {
                throw new Error('Client not Found!');
            }

            //Check if the seller is the one who is deleting
            if(client.seller.toString() !== ctx.user.id) {
                throw new Error('Not Authorized to delete this Client!');
            }

            //Deleting Client
            await Clients.findOneAndDelete({ _id: id });
            return 'Client was Deleted!';
        },

        newOrder: async (_, { input }, ctx) => {
            const { client } = input;

            //Check if client exist
            const clientExist = await Clients.findById(client);

            if(!clientExist) {
                throw new Error('Client not Found!');
            }

            //Check if client belongs to the seller who is preparing the order
            if(clientExist.seller.toString() !== ctx.user.id) {
                throw new Error('Not Authorized to make an Order with this Client!');
            }

            //Check if the stock is still available
            for await ( const article of input.order ) { //Nuevo operador asincrono que impide que mi app se malogre y no continua el codigo
                const { id } = article;

                const product = await Products.findById(id);
                
                if(article.amount > product.exist) {
                    throw new Error(`The Product: ${product.name} exceed the available amount`);
                } else {
                    //Subtract the amount fromt the available
                    product.exist = product.exist - article.amount;

                    await product.save();
                }
            };

            //Create New Order
            const newOrder = new Orders(input);

            //Assign to a seller
            newOrder.seller = ctx.user.id;

            //Save into the DB
            const order = await newOrder.save();
            return order;
        },

        updateOrder: async (_, { id, input }, ctx) => {
            const { client } = input;

            //Check order exist
            const orderExist = await Orders.findById(id);

            if(!orderExist) {
                throw new Error('Order was not Found!');
            }

            //Check client exist
            const clientExist = await Clients.findById(client);

            if(!clientExist) {
                throw new Error('Client was not Found');
            }

            //Check if order and client belongs to seller
            if(clientExist.seller.toString() !== ctx.user.id) {
                throw new Error('Not Authorized to Edit an Order with this Client!');
            }

            if(input.order) {
                //Check stock available
                for await ( const article of input.order ) { //Nuevo operador asincrono que impide que mi app se malogre y no continua el codigo
                    const { id } = article;

                    const product = await Products.findById(id);
                    
                    if(article.amount > product.exist) {
                        throw new Error(`The Product: ${product.name} exceed the available amount`);
                    } else {
                        //Subtract the amount fromt the available
                        product.exist = product.exist - article.amount;

                        await product.save();
                    }
                };
            }

            //Save order into DB
            const orderUpdated = await Orders.findOneAndUpdate({_id: id}, input, { new: true});
            return orderUpdated;
        },

        deleteOrder: async (_, { id }, ctx) => {
            //Check if order exist
            const order = await Orders.findById(id);

            if(!order) {
                throw new Error('Order was not Found!');
            }

            //Check if order and client belongs to seller
            if(order.seller.toString() !== ctx.user.id) {
                throw new Error('Not Authorized to Delete an Order with this Client!');
            }

            //Deleting the order
            await Orders.findOneAndDelete({_id: id});
            return 'Order Deleted!';
        }
    }
};

//EXPORTING RESOLVERS
module.exports = resolvers;
//CALL MODULES AND METHODS
const mongoose = require('mongoose');
require('dotenv').config({
    path: 'variables.env'
});

//CONNECTION
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });

        console.log('DB Connected');
    } catch (err) {
        console.log('Error Detected');
        console.log(err);
        process.exit(1); //Stop the app
    }
};

//EXPORTING CONNECTION TO DB
module.exports = connectDB;
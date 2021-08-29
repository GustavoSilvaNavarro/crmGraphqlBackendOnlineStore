//CALL MODULES AND METHODS
const mongoose = require('mongoose');

//DEFINING SCHEMA
const UsersSchema = mongoose.Schema({
    name: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, trim: true },
    created: {type: Date, default: Date.now() }
});

//EXPORTING SCHEMA AND MODEL
module.exports = mongoose.model('Users', UsersSchema);
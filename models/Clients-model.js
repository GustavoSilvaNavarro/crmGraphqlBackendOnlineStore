//CALL MODULES AND METHODS
const mongoose = require('mongoose');

//DEFINING SCHEMA
const ClientsSchema = mongoose.Schema({
    name: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    phone: { type: String, trim: true },
    created: { type: Date, default: Date.now() },
    seller: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Users' }
});

//EXPORTING SCHEMA
module.exports = mongoose.model('Clients', ClientsSchema);
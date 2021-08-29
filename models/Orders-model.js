//CALL MODULES AND METHODS
const mongoose = require('mongoose');

//DEFINING SCHEMA
const OrdersSchema = mongoose.Schema({
    order: { type: Array, required: true },
    total: { type: Number, required: true },
    client: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Clients' },
    seller: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Users' },
    state: { type: String, default: 'PENDING' },
    created: { type: Date, default: Date.now() }
});

//EXPORTING MODEL AND SCHEMA
module.exports = mongoose.model('Orders', OrdersSchema);
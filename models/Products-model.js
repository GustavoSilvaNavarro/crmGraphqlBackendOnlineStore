//CALL MODULES AND METHODS
const mongoose = require('mongoose');

//DEFINING SCHEMA
const ProductsSchema = mongoose.Schema({
    name: { type: String, required: true, trim: true },
    exist: { type: Number, required: true, trim: true },
    price: { type: Number, required: true, trim: true },
    created: { type: Date, default: Date.now() }
});

//SEARCH PRODUCTS
//Enable and index of text type
ProductsSchema.index({ name: 'text' });

//EXPOTING SCHEMA AND MODEL
module.exports = mongoose.model('Products', ProductsSchema);
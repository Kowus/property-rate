const mongoose = require('mongoose');
let ownerSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    othername: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    phone: {
        type:String
    },
    address: String,
    properties:Array
});
module.exports = mongoose.model('Onwer', ownerSchema);
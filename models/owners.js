const mongoose = require('mongoose');
let ownerSchema = new mongoose.Schema({
    givenName: {
        type: String,
        required: true
    },
    familyName: {
        type: String,
        required: true
    },
    displayName: {
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
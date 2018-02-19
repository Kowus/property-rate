const mongoose = require('mongoose');
var areaSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        unique: true
    },
    properties: [{type: mongoose.Schema.Types.ObjectId, ref: 'Property'}],
    loc: {
        x: {
            min: Number,
            max: Number
        },
        y: {
            min: Number,
            max: Number
        }
    }
});

module.exports = mongoose.model('Area', areaSchema);
const mongoose = require('mongoose');
var areaSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        unique: true
    }
});

module.exports = mongoose.model('Area', areaSchema);
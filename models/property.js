const mongoose = require('mongoose');
let propSchema  = new mongoose.Schema({
    num: String,
    area: mongoose.Schema.Types.ObjectId,
    rate_val: {
        type:Number,
        default: 33
    },
    use_code:String,
    sanitation_code: String,
    location: {
        x: Number,
        y: Number,
        description: String
    },
    owner: mongoose.Schema.Types.ObjectId
});
module.exports = mongoose.model('property', propSchema);
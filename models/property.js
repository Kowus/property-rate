const mongoose = require('mongoose');
let propSchema  = new mongoose.Schema({
    prop_num: String,
    area: {type:mongoose.Schema.Types.ObjectId,ref:'Area'},
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
    owner: {type:mongoose.Schema.Types.ObjectId,ref:'User'}
});
module.exports = mongoose.model('Property', propSchema);
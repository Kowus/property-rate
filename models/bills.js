/*
 * property-rate ==> bills
 * Created By barnabasnomo on 1/23/18 at 3:40 PM
 * @soundtrack Bad Guy - Eminem
*/
const mongoose = require('mongoose'),
    Schema = mongoose.Schema
;

let Bill = new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    properties:[{
        type:Schema.Types.ObjectId,
        ref:"Property"
    }],
    total:Number
});

module.exports = mongoose.model('Bill', Bill);
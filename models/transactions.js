/*
 * property-rate ==> transactions
 * Created By barnabasnomo on 1/23/18 at 3:40 PM
 * @soundtrack Bad Guy - Eminem
*/

const mongoose = require('mongoose'),
    Schema = mongoose.Schema
;

let Transaction = new Schema({
    bill: {
        type: Schema.Types.ObjectId,
        ref: 'Bill'
    },
    expected: Number,
    paid: Number,
    date: {
        type: Date,
        default: Date.now()
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref:'User'
    }
});

module.exports = mongoose.model('Transaction', Transaction);
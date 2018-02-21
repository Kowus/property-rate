/*
 * property-rate ==> bills
 * Created By barnabasnomo on 1/23/18 at 3:40 PM
 * @soundtrack Bad Guy - Eminem
*/
const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    User = require('./user')
;

let billSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    properties: [{
        type: Schema.Types.ObjectId,
        ref: "Property"
    }],
    settled: {
        type: Number,
        default: 0
    },
    total: Number,
    createdAt: {type: Date, default: Date.now},
    transactions: [{type: Schema.Types.ObjectId, ref: 'Transaction'}],
    paid: {type: Boolean, default: false}
});


billSchema.pre('save', function (next) {
    let bill = this;
    if (this.isNew || this.isModified('owner')) {
        User.findOneAndUpdate({_id: bill.owner}, {
            $push: {
                bill: {
                    $position: 0,
                    $each: [bill._id]
                }
            }
        }).exec(err => {
            if (err) return next(err);
            return next();
        });
    }
});

module.exports = mongoose.model('Bill', billSchema);
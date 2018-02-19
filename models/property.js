const mongoose = require('mongoose'),
    Area = require('./area')
;
let propSchema = new mongoose.Schema({
    prop_num: {
        type:String,
        unique:true
    },
    area: {type: mongoose.Schema.Types.ObjectId, ref: 'Area'},
    rate_val: {
        type: Number,
        default: 33
    },
    rate_impost:{
        type:Number,
        default:.5
    },
    len:Number,
    createdAt:{
        type:Date,
        default:Date.now
    },
    wid:Number,
    rcn:Number,
    dep:Number,
    use_code: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Use_code'
    },
    sanitation_code: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'San'
    },
    location: {
        x: Number,
        y: Number,
        description: String
    },
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

propSchema.pre('save', function (next) {
    let prop = this;
    if (this.isModified('area')||this.isModified('prop_num') || this.isNew) {
        Area.findOne({_id: prop.area}, {_id: 0, code: 1}, (err, area) => {
            if (err) {
                return next(new Error(err));
            }
            prop.prop_num = area.code + prop.prop_num;
            next();
        });

    } else {
        return next();
    }
});
module.exports = mongoose.model('Property', propSchema);

/*

propSchema.post('save', function (doc) {
    Area.findOneAndUpdate({_id: doc.area}, {
        $push: {
            properties: {
                $each:[doc._id],
                $position:0
            }
        }
    }).exec(err=>{
        if (err) {console.error(err)}
    });
});
*/
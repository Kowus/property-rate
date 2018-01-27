const mongoose = require('mongoose'),
    Area = require('./area')
;
let propSchema = new mongoose.Schema({
    prop_num: String,
    area: {type: mongoose.Schema.Types.ObjectId, ref: 'Area'},
    rate_val: {
        type: Number,
        default: 33
    },
    use_code: String,
    sanitation_code: String,
    location: {
        x: Number,
        y: Number,
        description: String
    },
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});
module.exports = mongoose.model('Property', propSchema);

/*
propSchema.pre('save', function (next) {
    let prop = this;
    if (this.isModified('area') || this.isNew) {
        Area.findOneAndUpdate({_id: prop.area}, {_id: 0, code: 1},{
            $push: {
                properties: {
                    $each:[prop._id],
                    $position:0
                }
            }
        }, (err, areaCode) => {
            if (err) {
                return next(new Error(err));
            }
            prop.prop_num = areaCode.code + prop.prop_num;
            next();
        });

    } else {
        return next();
    }
});

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
const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    securePassword = require('secure-password');
let pwd = securePassword();

let userSchema = new Schema({
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
        type: String
    },
    address: String,
    properties: [
        {type: Schema.Types.ObjectId, ref: 'Property'}
        ],
    password: {type: Buffer, required: true}
});
userSchema.pre('save', function (next) {
    let user = this;
    this.displayName = `${user.given_name} ${user.family_name}`;
    /*if(this.isNew){
        user.account_stat.confirmation_str = gib();
    }*/
    if (this.isModified('password') || this.isNew) {
        let userPassword = Buffer.from(user.password);
        pwd.hash(userPassword, function (err, hash) {
            if (err) return next(err);
            pwd.verify(userPassword, hash, function (err, result) {
                if (err) return next(err);
                if (result === securePassword.INVALID_UNRECOGNIZED_HASH) {
                    let err = new Error('This hash was not made with secure-password. Attempt legacy algorithm');
                    return next(err);
                }
                if (result === securePassword.INVALID) {
                    let err = new Error('Imma call the cops');
                    return next(err);
                }

                if (result === securePassword.VALID) {
                    user.password = hash;
                    next();
                }
                if (result === securePassword.VALID_NEEDS_REHASH) {
                    pwd.hash(userPassword, function (err, improvedHash) {
                        if (err) {
                            console.error('');
                            return next();
                        }
                        user.password = improvedHash;
                        next();
                    });
                }
            });
        })
    }
    else {
        return next();
    }
});

userSchema.methods.comparePassword = function (password, cb) {

    pwd.verify(Buffer.from(password), this.password, function (err, result) {
        if (err) return cb(err);
        cb(null, result === securePassword.VALID || result === securePassword.VALID_NEEDS_REHASH);
    });
};


module.exports = mongoose.model('User', userSchema);
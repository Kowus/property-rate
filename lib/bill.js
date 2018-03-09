/*
 * property-rate ==> bill
 * Created By barnabasnomo on 2/2/18 at 1:51 PM
 * @soundtrack The Bird - Anderson .Paak
*/

const User = require('../models/user'),
    Bill = require('../models/bills'),
    Promise = require('bluebird'),
    async = require('async'),
    mailer = require('../config/sendmail')
    ;

let generateBills = Promise.promisify(done => {
    User.find({}, { password: 0 })
        .lean()
        .populate({
            path: 'properties bill',
            populate: [
                {
                    path: 'area', select: 'name code'
                },
                {
                    path: 'use_code'
                }, {
                    path: 'sanitation_code'
                }, {
                    path: 'bill'
                }
            ]
        }).exec((err, users) => {
            if (err) return done(err);
            users.forEach(user => {
                let prop_bills = 0;
                let props = [];

                if (user.bill[0] && new Date(user.bill[0].createdAt).getFullYear() == new Date().getFullYear()) {
                    return console.log('bill')
                }
                else {
                    if (user.bill[0]) {
                        console.log(user.bill[0])
                        console.log(new Date(user.bill[0].createdAt).getFullYear(), new Date().getFullYear())
                    }
                    if (user.properties.length > 0) {
                        user.properties.forEach(prop => {
                            props.push({
                                prop_num: prop.prop_num,
                                prop_cost: round_number(Number((prop.rate_impost * prop.rate_val) + prop.sanitation_code.rate))
                            });
                            prop_bills += round_number(Number((prop.rate_impost * prop.rate_val) + prop.sanitation_code.rate));
                        });

                        let newBill = new Bill({
                            owner: user._id,
                            properties: user.properties,
                            total: round_number(prop_bills)
                        });
                        if (user.bill[0] && !user.bill[0].paid) {
                            newBill.arrears = {
                                bill: user.bill[0]._id,
                                amount: user.bill[0].total - user.bill[0].settled
                            };
                            newBill.total += (user.bill[0].total - user.bill[0].settled);
                        }
                        return newBill.save((err, bill) => {
                            if (err) return callback(err);
                            mailer.sendBill(user, bill, props);
                            console.log(bill);
                        });

                    }
                }
                /*console.log(`${user.displayName}
                Total: ${prop_bills}`)*/

            });
            return done(null, users);
        });
});


function round_number(value, places) {
    if (places) {
        var pow = Math.pow(10, places);
        return Math.round(value, pow) / pow;
    } else {
        return Math.round(value * 100) / 100;
    }
}

module.exports = {
    generateBills: generateBills
};
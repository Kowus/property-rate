/*
 * property-rate ==> bill
 * Created By barnabasnomo on 2/2/18 at 1:51 PM
 * @soundtrack The Bird - Anderson .Paak
*/

const User = require('../models/user'),
    Bill = require('../models/bills'),
    Promise = require('bluebird'),
    async = require('async')
;

let generateBills = Promise.promisify(done=>{
        User.find({},{password:0})
            .lean()
            .populate({
                path: 'properties',
                populate: [
                    {
                        path:'area', select: 'name code'
                    },
                    {
                        path:'use_code'
                    }, {
                    path: 'sanitation_code'
                    }
                ]
            }).exec((err,users)=>{
            if (err) return done (err);
            users.forEach(user=>{
                let prop_bills = 0;
               user.properties.forEach(prop=>{
                   prop_bills+=Number((prop.use_code.rate*prop.rate_val)+prop.sanitation_code.rate);
                   // console.log("prop bill: "+String((prop.use_code.rate*prop.rate_val)+prop.sanitation_code.rate));
               });
                console.log(`prop bill for ${user.displayName}: ${prop_bills}`)
            });
            return done(null, users)
        })
});


module.exports = {
    generateBills: generateBills
};
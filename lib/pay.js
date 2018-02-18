/*
 * property-rate ==> pay
 * Created By barnabasnomo on 2/15/18 at 12:16 PM
 * @soundtrack Pound Cake/Paris Morton Music 2 (feat. Jay-Z) - Drake
*/

const hubtelmobilepayment = require('hubtelmobilepayment'),
    bluebird = require('bluebird'),
    env = require('../config/env'),
    hubpay = new hubtelmobilepayment({
        clientid: env.hubtel.clientid,
        secretid: env.hubtel.secretid,
        merchantaccnumber: env.hubtel.merchantaccnumber
    }),
    receive = bluebird.promisify((customer, done) => {
        const payload = {
            'Amount': customer.amount,
            'Channel': customer.channel,
            'CustomerEmail': customer.email,
            'CustomerMsisdn': customer.phone,
            'CustomerName': customer.displayName,
            'Description': `payment of bill ${customer.bill}`,
            'PrimaryCallbackUrl':env.hubtel.callbackurl
        };

        hubpay.ReceiveMobileMoney(payload)
            .then(function (data) {
                return done(null, data);
            })
            .catch(function (err) {
                return done(err);
            });
    })
;


module.exports = {
    receive: receive
};
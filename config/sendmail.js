/*
 * property-rate ==> sendmail
 * Created By barnabasnomo on 11/29/17 at 4:37 PM
*/
const Email = require('email-templates'),
    path = require('path'),
    nodemailer = require('nodemailer'),
    env = require('./env'),
    moment = require('moment')
;
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: env.node_mailer.user,
        pass: env.node_mailer.pass

    }
});
const email = new Email({
    message: {
        from: 'Barnabas Nomo <barnabasnomo@gmail.com>'
    },
    // send:true,
    transport: transporter, views: {
        options: {
            extension: 'handlebars'
        }
    }
});


module.exports = {
    sendWelcome: function (user, token) {
        email.send({
            template: path.normalize('../../views/email/confirm_account'),
            message: {
                to: `${user.displayName} <${user.email}>`
            },
            locals: {
                user: {
                    displayName: user.displayName
                }, token: token
            }
        }).then(console.log).catch(console.error);
    },
    sendBill: function (user, bill, date) {
        email.send({
            template: 'bill',
            message: {
                to: `${user.displayName} <${user.email}>`
            },
            locals: {
                user: user,
                bill: bill,
                date: moment(date).format('Do MMM. YYYY')
            }
        }).then(console.log).catch(console.error);
    }
};
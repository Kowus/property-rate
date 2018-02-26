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
        from: 'The Property Rate Mobilization Team <eveharrison4real@gmail.com>'
    },
    // send:true,
    transport: transporter, views: {
        options: {
            extension: 'handlebars'
        }
    }
});


module.exports = {
    reset: function (user) {
        email.send({
            template: 'change_pass',
            message: {
                to: `${user.displayName} <${user.email}>`
            },
            locals: { user: user }
        }).then(console.log).catch(console.error)
    },
    password: function (user) {
        email.send({
            template: 'change_pass',
            message: {
                to: `${user.displayName} <${user.email}>`
            },
            locals: { user: user }
        }).then(console.log).catch(console.error)
    },
    newUser: function (user, pwd) {
        email.send({
            template: 'new_user',
            message: {
                to: `${user.displayName} <${user.email}>`
            }, locals: {
                user: user,
                createdPassword: pwd
            }
        }).then(console.log).catch(console.error)
    },
    sendWelcome: function (user) {
        email.send({
            template: path.normalize('confirm_account'),
            message: {
                to: `${user.displayName} <${user.email}>`
            },
            locals: {
                user: {
                    displayName: user.displayName
                }
            }
        }).then(console.log).catch(console.error);
    },
    sendBill: function (user, bill, props) {
        email.send({
            template: 'bill',
            message: {
                to: `${user.displayName} <${user.email}>`
            },
            locals: {
                user: user,
                bill: bill,
                date: moment(bill.createdAt).format('Do MMM. YYYY'),
                props: props

            }
        }).then(console.log).catch(console.error);
    }
};
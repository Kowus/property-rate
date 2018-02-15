/*
 * property-rate ==> env
 * Created By barnabasnomo on 11/29/17 at 4:28 PM
*/

module.exports = {
    database: {
        url: process.env.MONGODB_URI
    },
    node_mailer: {
        user: process.env.NODE_MAILER_AUTH_EMAIL,
        pass: process.env.NODE_MAILER_AUTH_PASSWORD
    },
    redis: {
        url: process.env.REDIS_URL
    },
    session: {
        secret: process.env.SESSION_SECRET
    },
    hubtel:{
        clientid:process.env.HUBTEL_CLIENT_ID,
        secretid:process.env.HUBTEL_SECRET_ID,
        merchantaccnumber: process.env.HUBTEL_MERCHANT
    }
};
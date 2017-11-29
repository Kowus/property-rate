/*
 * property-rate ==> env
 * Created By barnabasnomo on 11/29/17 at 4:28 PM
*/
module.exports = {
    node_mailer:{
        user:process.env.NODE_MAILER_AUTH_EMAIL,
        pass:process.env.NODE_MAILER_AUTH_PASSWORD
    }
};
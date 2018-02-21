/*
 * property-rate ==> ticket
 * Created By barnabasnomo on 2/21/18 at 9:22 AM
 * @soundtrack Let's Get It On - www.Jalibury.com - T-Pain
*/

const mongoose = require('mongoose'),
    Schema = mongoose.Schema
;
let ticketSchema = Schema({
    balance: {
        type:Number,
        default:round_number(Math.random()*10000)
    },
    owner:{type:Schema.Types.ObjectId,ref:'User', required:true}
});
module.exports= mongoose.model('Ticket', ticketSchema);

function round_number(value, places) {
    if (places) {
        var pow = Math.pow(10, places);
        return Math.round(value, pow) / pow;
    } else {
        return Math.round(value * 100) / 100;
    }
}

/*
 * property-rate ==> ticket
 * Created By barnabasnomo on 2/21/18 at 9:22 AM
 * @soundtrack Let's Get It On - www.Jalibury.com - T-Pain
*/

const mongoose = require('mongoose'),
    Schema = mongoose.Schema
;
let ticketSchema = Schema({
    balance:Number,
    owner:{type:Schema.Types.ObjectId,ref:'User', required:true}
});
module.exports= mongoose.model('Ticket', ticketSchema);
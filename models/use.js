/*
 * property-rate ==> use
 * Created By barnabasnomo on 1/22/18 at 5:34 PM
 * @soundtrack Joromi - Simi
*/

const mongoose = require('mongoose');
let useCodeSchema  = new mongoose.Schema({
    code: String,
    name:String,
    rate:Number
});
module.exports = mongoose.model('Use_code', useCodeSchema);

/*
let use = require('./use-code');

use.forEach(item=>{
    console.log(`
        ${item.code}:{
            name: "${item.name}",
            rate: ${item.rate}
        },
    `)
})*/

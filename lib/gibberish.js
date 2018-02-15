/*
 * the-nomad.com ==> gibberish
 * Created By barnabasnomo on 11/30/17 at 3:54 AM
*/
module.exports=function () {
    let strlen = 15;
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.~!@#^*()_+$%&";

    for (let i = 0; i < strlen; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};


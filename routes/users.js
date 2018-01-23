var express = require('express'),
    router = express.Router(),
    User = require('../models/user'),
    Area = require('../models/area'),
    use_code= require('../models/use-code'),
    sanitation =require('../models/sanitation')
;
/* GET users listing. */
router.get('/:_id', function(req, res, next) {
    User.findOne({_id:req.params._id}).exec(function (err, user) {
        res.render('user',{owner:user, use_code:use_code, sanitation:sanitation})
    })
});






module.exports = router;
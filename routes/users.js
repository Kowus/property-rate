var express = require('express'),
    router = express.Router(),
    User = require('../models/user'),
    Area = require('../models/area')
;
/* GET users listing. */
router.get('/:_id', function(req, res, next) {
    User.findOne({_id:req.params._id}).exec(function (err, user) {
        res.json(user)
    })
});





module.exports = router;
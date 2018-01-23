var express = require('express'),
    router = express.Router(),
    User = require('../models/user'),
    Area = require('../models/area')
;
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/create',function (req, res, next) {
    let newUser = new User({
        givenName:req.body.givenName,
        familyName:req.body.familyName,
        email: req.body.email,
        displayName: `${req.body.givenName} ${req.body.familyName}`
    });

    newUser.save((err, user)=>{
      if (err) return res.json(err);
      else res.json(user)
    });

});



module.exports = router;
var express = require('express');
var router = express.Router();
var Property = require('../models/property');

router.get('/all', function (req, res, next) {
    var all = Property.find();
    all.exec(function (err, properties) {
        if (err) return res.send(err);
        res.json(properties);
    });
});

router.post('/create', function (req, res, next) {
   var newProperty = new Property ({
       num: req.body.num,
       area: req.body.area,
       use_code:req.body.use_code,
       sanitation_code: req.body.sanitation_code,
       location: {
           x: Number(req.body.loc_x),
           y: Number(req.body.loc_y),
           description: req.body.loc_des
       },
       owner: req.body.owner
   });
   newProperty.save(function (err, property) {
       if (err) return res.json(err);
       res.json(property);
   })
});

module.exports = router;
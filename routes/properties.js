var express = require('express'),
    router = express.Router(),
    Property = require('../models/property'),
    User = require('../models/user'),
    mail =require('../config/sendmail')
;


router.get('/all', function (req, res, next) {
    var all = Property.find();
    all.exec(function (err, properties) {
        if (err) return res.send(err);
        res.json(properties);
    });
});

router.post('/create', function (req, res, next) {
    var newProperty = new Property({
        num: Number(req.body.num),
        area: req.body.area,
        use_code: req.body.use_code,
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
        User.findOneAndUpdate({_id: property.owner}, {
            $push: {
                properties: {
                    $each: [property._id],
                    $position: 0
                }
            }
        }, (err, user) => {
            if (err) return res.status(404).json(err);
            else res.json(property);
        });
    });
});

module.exports = router;
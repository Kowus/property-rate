var express = require('express'),
    router = express.Router(),
    User = require('../models/user'),
    Area = require('../models/area'),
    use_code = require('../models/use-code'),
    sanitation = require('../models/sanitation'),
    Property = require('../models/property'),
    async = require('async')
;
/* GET users listing. */
router.get('/:_id', function (req, res, next) {
    User.findOne({_id: req.params._id}).exec(function (err, user) {
        res.render('user', {owner: user, use_code: use_code, sanitation: sanitation});
    });
});
router.post('/add_prop', function (req, res, next) {
    let newProp = new Property({
        prop_num: req.body.prop_num,
        area: req.body.area,
        use_code: req.body.use_code,
        sanitation_code: req.body.sanitation_code,
        owner: req.body.owner,
        location: {
            x: req.body.x,
            y: req.body.y,
            description: req.body.loc_des
        }
    });

    newProp.save(function (err, prop) {
        if (err) return res.send(err);
        async.parallel(
            [
                function (callback) {
                    User.findOneAndUpdate({_id: prop.owner}, {
                        $push: {
                            properties: {
                                // how to do push on Update
                                $each: [prop._id],
                                $position: 0
                            }
                        }
                    }).exec(function (err) {
                        if (err) return callback(err);
                        callback();
                    });
                }, function (callback) {
                Area.findOneAndUpdate({_id: prop.area}, {
                    $push: {
                        properties: {
                            // how to do push on Update
                            $each: [prop._id],
                            $position: 0
                        }
                    }
                }).exec(function (err) {
                    if (err) return callback(err);
                    callback();
                });
            }],
            (err, result) => {
                if (err) return res.send(err);
                console.log(prop);
                res.json(prop);
            }
        );
        /*
        User.findOneAndUpdate({_id: req.body.owner}, {
            $push:{
                properties:{
                // how to do push on Update
                    $each:[prop._id],
                    $position:0
                }
            }
        }).exec(function (err) {
            if (err) return res.send(err);
            console.log(prop);
            res.json(prop)
        })

         */
    });
});


module.exports = router;
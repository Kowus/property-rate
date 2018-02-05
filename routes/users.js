var express = require('express'),
    router = express.Router(),
    User = require('../models/user'),
    Area = require('../models/area'),
    use_code = require('../models/use-code'),
    sanitation = require('../models/sanitation'),
    Property = require('../models/property'),
    async = require('async'),
    mail = require('../config/sendmail'),
    Bill = require('../lib/bill')
;
router.get('/', function (req, res, next) {
    res.render('s-create-user');
});

router.get('/create', function (req, res, next) {
    res.render('create-user');
});
router.post('/create', function (req, res, next) {
    // res.send(req.body)
    User.findOne({email: req.body.email}, function (err, user) {
        if (err) return done(err);
        if (user) {
            res.render('create-user', {message: 'That email has already been used with an account.'});
        } else {
            if (req.body.password !== req.body.cpassword) {
                res.render('create-user', {message: 'Passwords do not match.'});
            }
            let newUser = new User({
                givenName: req.body.givenName,
                familyName: req.body.familyName,
                email: req.body.email,
                password: req.body.password,
                gender: req.body.gender
            });

            newUser.save(function (err, user) {
                if (err) {
                    console.log(err);
                    // return done(null, false, req.flash('signupMessage', "Couldn't create your account."));
                    res.render('create-user', {message: "Couldn't create the account."});
                }
                // return done(null,user);
                mail.sendWelcome(user);
                res.render('create-user', {success_message: `Successfully created user with _id: ${user._id} and email: ${user.email}.`});

            });
        }
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


router.get('/generate-bills', function (req, res, next) {
    Bill.generateBills()
        .then(response => {
            res.json(response);
        }).catch(err => {
        res.json(err);
    });
});

router.get('/:_id', function (req, res, next) {
    User.findOne({_id: req.params._id}).populate({
        path: 'properties',
        populate: [
            {
                path: 'area', select: 'code name'
            },{
                path: 'use_code', select: 'code name'
            }
        ]
    }).exec(function (err, user) {
        if (err) console.error(err);
        console.log(user);
        res.render('user', {owner: user, use_code: use_code, sanitation: sanitation});
    });
});
module.exports = router;
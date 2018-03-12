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
router.post('/update', needsGroup('admin'), function (req, res, next) {
    User.findOneAndUpdate({ _id: req.body._id }, {
        $set: {
            givenName: req.body.givenName,
            familyName: req.body.familyName,
            email: req.body.email,
            displayName: `${req.body.givenName} ${req.body.familyName}`
        }
    }, function (err) {
        if (err) console.error(err);
        res.redirect('/users/' + req.body._id);
    });

});
router.post('/create', needsGroup('admin'), function (req, res, next) {
    // res.send(req.body)
    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) return done(err);
        if (user) {
            res.render('create-user', { message: 'That email has already been used with an account.' });
        } else {
            let gib = require('../lib/gibberish');
            let pwd = gib();
            let newUser = new User({
                givenName: req.body.givenName,
                familyName: req.body.familyName,
                email: req.body.email,
                password: pwd,
                gender: req.body.gender
            });

            newUser.save(function (err, user) {
                if (err) {
                    console.log(err);
                    // return done(null, false, req.flash('signupMessage', "Couldn't create your account."));
                    return res.render('create-user', { message: "Couldn't create the account." });
                }
                // return done(null,user);
                mail.newUser(user, pwd);
                res.render('create-user', { success_message: `Successfully created user with _id: ${user._id} and email: ${user.email}.` });

            });
        }
    });
});


router.post('/add_prop', needsGroup('admin'), function (req, res, next) {
    let rcn = req.body.use_rate < 10 ? Math.random() * 9 : 0,
        dep = req.body.use_rate < 10 ? Math.random() * 6 : 0
        ;
    let newProp = new Property({
        prop_num: req.body.prop_num,
        len: req.body.len,
        wid: req.body.wid,
        rate_val: (req.body.len * req.body.wid * req.body.use_rate) + (rcn - dep),
        rcn: rcn,
        dep: dep,
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
                    User.findOneAndUpdate({ _id: prop.owner }, {
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
                    Area.findOneAndUpdate({ _id: prop.area }, {
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

    });
});




router.get('/:user_id', function (req, res, next) {
    // console.log(req.params)
    User.findOne({ _id: req.params.user_id }).populate({
        path: 'properties bill transactions',
        populate: [
            {
                path: 'area', select: 'code name'
            }, {
                path: 'use_code', select: 'code name'
            },
            {
                path: 'sanitation_code'
            },
            {
                path: 'properties',
                populate: [
                    {
                        path: 'area', select: 'code name'
                    }, {
                        path: 'use_code', select: 'code name rate'
                    }, {
                        path: 'sanitation_code'
                    }
                ]
            }
        ]
    }).exec(function (err, user) {
        if (err) console.error(err);
        let transid = req.session.transid || null,
            transtat = req.session.transtat || null
            ;
        req.session.transid = undefined;
        req.session.transtat = undefined;
        res.render('user', { isuser: String(req.user._id) == String(user._id), owner: user, use_code: use_code, sanitation: sanitation, transid: transid, transtat: transtat });
    });
});
module.exports = router;
function needsGroup(group) {
    return function (req, res, next) {
        if (req.user && req.user.group === group) {
            res.locals.user = req.user;
            next();
        }
        else {
            req.session.message = "Unauthorized Access";
            res.status(401).redirect(`/login?next=${req.originalUrl}`);
        }
    };
}
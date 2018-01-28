var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    use_code = require('../models/use-code'),
    sanitation = require('../models/sanitation'),
    Area = require('../models/area'),
    User = require('../models/user'),
    async = require('async'),
    Property = require('../models/property')
;


/* GET home page. */
router.get('/', isLoggedIn, function (req, res, next) {
    async.parallel(
        [

            function (callback) {
                User.count({}, function (err, count) {
                    if (err) return callback(err);
                    callback(null, count);

                });
            },
            function (callback) {
                Property.count({}, function (err, count) {
                    if (err) return callback(err);
                    callback(null, count);
                });
            },
            function (callback) {
                Property.count({
                    $or:[
                        {use_code:'AR1'},
                        {use_code:'AR2'},
                        {use_code:'AR3'},
                        {use_code:'AR4'},
                        {use_code:'AR5'},
                        {use_code:'AR6'}
                    ]
                }, function (err, count) {
                    if (err) return callback(err);
                    callback(null, count);
                });
            },
            function (callback) {
                Property.count({
                    $or:[
                        {use_code:'UR1'},
                        {use_code:'UR2'},
                        {use_code:'UR3'},
                        {use_code:'UR4'},
                        {use_code:'UR5'},
                        {use_code:'UR7'},
                        {use_code:'UR8'},
                        {use_code:'UR9'}
                    ]
                }, function (err, count) {
                    if (err) return callback(err);
                    callback(null, count);
                });
            },
            function (callback) {
                Property.count({use_code:'UR6'}, function (err, count) {
                    if (err) return callback(err);
                    callback(null, count);
                });
            }

        ], (err, results) => {
            if (err) {
                console.error(err);
                return res.send(err);
            }
            console.log(results);
            res.render('index', {title: 'Property Rate', no_users: results[0], no_props: results[1], no_ass:results[2], no_unass:results[3], no_unc:results[4]});
        }
    );
});
router.get('/login', isNotLoggedIn, function (req, res, next) {
    res.render('login', {title: 'Property Rate Login.', message: req.flash('loginMessage'), acc_zone: true});
});
router.get('/signup', isNotLoggedIn, function (req, res, next) {
    res.render('signup', {title: 'Property Rate Signup.', message: req.flash('signupMessage'), acc_zone: true});
});
router.get('/profile', isLoggedIn, function (req, res, next) {
    let next_page = req.session.next || '/';
    res.redirect(next_page);
});
/*router.get('/create-property', isLoggedIn, function (req, res, next) {
    res.render('create-property', {use_code: use_code, sanitation: sanitation});
});*/
router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/login');
});

router.post('/login', isNotLoggedIn, passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));


router.post('/signup', isNotLoggedIn, passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
}));

router.get('/area', function (req, res, next) {
    res.render('add-area');
});

router.post('/area', function (req, res, next) {
    let newArea = new Area({
        code: req.body.code,
        name: req.body.name
    });
    newArea.save((err, area) => {
        if (err) return res.json(err);
        else res.json(area);
    });
});


router.get('/search_user', function (req, res) {
    var regex = new RegExp(req.query["term"], 'i');
    var query = User.find(
        {
            $or: [
                {givenName: regex},
                {familyName: regex}
            ]
        });

    query.exec(function (err, users) {
        if (!err) {

            res.render('users', {users: users, term: req.query.term});
        } else {

            res.render('error', {
                error: {stack: "Couldn't find user", status: err.status || 500},
                message: err.message
            });
        }
    });
});


router.get('/search_area', function (req, res) {
    console.log(req.query);
    var regex = new RegExp(req.query.term, 'i');
    console.log(regex);
    var query = Area.find(
        {
            $or: [
                {code: regex},
                {name: regex}
            ]
        }, {
            properties: 0
        }
    );

    // Execute query in a callback and return users list
    query.exec(function (err, areas) {
        if (err) {
            res.send(JSON.stringify(err), {
                'Content-Type': 'application/json'
            }, 404);
        }
        if (!err) {
            // Method to construct the json result set
            console.log(areas);
            res.json(areas);
        }
    });
});


module.exports = router;


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = {
            displayName: req.user.displayName,
            email: req.user.email

        };
        return next();
    }
    res.redirect('/login');
}

function isNotLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        res.redirect('/profile');
    else
        return next();
}

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

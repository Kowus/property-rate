var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    use_code = require('../models/use-code'),
    Sanitation = require('../models/sanitation'),
    Area = require('../models/area'),
    User = require('../models/user'),
    async = require('async'),
    Property = require('../models/property'),
    UseCode=require('../models/use')
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
            /*
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
            }*/

        ], (err, results) => {
            if (err) {
                console.error(err);
                return res.send(err);
            }
            console.log(results);
            res.render('index', {title: 'Property Rate', no_users: results[0], no_props: results[1], /*no_ass:results[2], no_unass:results[3], no_unc:results[4]*/});
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

router.get('/area_search',function (req, res, next) {
   res.render('search-area');
});
router.get('/search_by_area', function (req, res, next) {
    Area.findOne({_id:req.query.term}).populate({
        path: 'properties',
        populate:[
            {
                path:'use_code'
            }, {
            path: 'sanitation_code'
            }, {
            path: 'owner', select:'displayName email',
                populate:[
                    {path:'bill'}
                ]
            }
        ]
    }).exec(function (err, area) {
        if(err)return res.send(err);
        res.render('areas', {term:area.name, area:area})
        // res.json(area)
    })
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
            res.json(areas);
        }
    });
});
router.get('/search_use', function (req, res) {
    console.log(req.query);
    var regex = new RegExp(req.query.term, 'i');
    console.log(regex);
    var query = UseCode.find(
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
    query.exec(function (err, use_code) {
        if (err) {
            res.send(JSON.stringify(err), {
                'Content-Type': 'application/json'
            }, 404);
        }
        if (!err) {
            // Method to construct the json result set
            res.json(use_code);
        }
    });
});
router.get('/search_san', function (req, res) {
    console.log(req.query);
    var regex = new RegExp(req.query.term, 'i');
    console.log(regex);
    var query = Sanitation.find(
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
    query.exec(function (err, san) {
        if (err) {
            res.send(JSON.stringify(err), {
                'Content-Type': 'application/json'
            }, 404);
        }
        if (!err) {
            // Method to construct the json result set
            res.json(san);
        }
    });
});

router.get('/getJson', function (req, res, next) {
    console.log('JSON result')
    res.json({
        "type": "FeatureCollection",
        "features": [
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -0.145365,
                        51.506182
                    ]
                },
                "type": "Feature",
                "properties": {
                    "category": "patisserie",
                    "hours": "10am - 6pm",
                    "description": "Modern twists on classic pastries. We're part of a larger chain of patisseries and cafes.",
                    "name": "Josie's Patisserie Mayfair",
                    "phone": "+44 20 1234 5678"
                }
            },
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -2.579623,
                        51.452251
                    ]
                },
                "type": "Feature",
                "properties": {
                    "category": "patisserie",
                    "hours": "10am - 6pm",
                    "description": "Come and try our award-winning cakes and pastries. We're part of a larger chain of patisseries and cafes.",
                    "name": "Josie's Patisserie Bristol",
                    "phone": "+44 117 121 2121"
                }
            },
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        1.273459,
                        52.638072
                    ]
                },
                "type": "Feature",
                "properties": {
                    "category": "patisserie",
                    "hours": "10am - 6pm",
                    "description": "Whatever the occasion, whether it's a birthday or a wedding, Josie's Patisserie has the perfect treat for you. We're part of a larger chain of patisseries and cafes.",
                    "name": "Josie's Patisserie Norwich",
                    "phone": "+44 1603 123456"
                }
            },
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -1.882509,
                        50.848831
                    ]
                },
                "type": "Feature",
                "properties": {
                    "category": "patisserie",
                    "hours": "10am - 6pm",
                    "description": "A gourmet patisserie that will delight your senses. We're part of a larger chain of patisseries and cafes.",
                    "name": "Josie's Patisserie Wimborne",
                    "phone": "+44 1202 343434"
                }
            },
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -2.985933,
                        53.408899
                    ]
                },
                "type": "Feature",
                "properties": {
                    "category": "patisserie",
                    "hours": "10am - 6pm",
                    "description": "Spoil yourself or someone special with our classic pastries. We're part of a larger chain of patisseries and cafes.",
                    "name": "Josie's Patisserie Liverpool",
                    "phone": "+44 151 444 4444"
                }
            },
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -1.689423,
                        52.632469
                    ]
                },
                "type": "Feature",
                "properties": {
                    "category": "patisserie",
                    "hours": "10am - 6pm",
                    "description": "Come and feast your eyes and tastebuds on our delicious pastries and cakes. We're part of a larger chain of patisseries and cafes.",
                    "name": "Josie's Patisserie Tamworth",
                    "phone": "+44 5555 55555"
                }
            },
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -3.155305,
                        51.479756
                    ]
                },
                "type": "Feature",
                "properties": {
                    "category": "patisserie",
                    "hours": "10am - 6pm",
                    "description": "Josie's Patisserie is family-owned, and our delectable pastries, cakes, and great coffee are renowed. We're part of a larger chain of patisseries and cafes.",
                    "name": "Josie's Patisserie Cardiff",
                    "phone": "+44 29 6666 6666"
                }
            },
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -0.725019,
                        52.668891
                    ]
                },
                "type": "Feature",
                "properties": {
                    "category": "cafe",
                    "hours": "8am - 9:30pm",
                    "description": "Oakham's favorite spot for fresh coffee and delicious cakes. We're part of a larger chain of patisseries and cafes.",
                    "name": "Josie's Cafe Oakham",
                    "phone": "+44 7777 777777"
                }
            },
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -2.477653,
                        53.735405
                    ]
                },
                "type": "Feature",
                "properties": {
                    "category": "cafe",
                    "hours": "8am - 9:30pm",
                    "description": "Enjoy freshly brewed coffe, and home baked cakes in our homely cafe. We're part of a larger chain of patisseries and cafes.",
                    "name": "Josie's Cafe Blackburn",
                    "phone": "+44 8888 88888"
                }
            },
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -0.211363,
                        51.108966
                    ]
                },
                "type": "Feature",
                "properties": {
                    "category": "cafe",
                    "hours": "8am - 9:30pm",
                    "description": "A delicious array of pastries with many flavours, and fresh coffee in an snug cafe. We're part of a larger chain of patisseries and cafes.",
                    "name": "Josie's Cafe Crawley",
                    "phone": "+44 1010 101010"
                }
            },
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -0.123559,
                        50.832679
                    ]
                },
                "type": "Feature",
                "properties": {
                    "category": "cafe",
                    "hours": "8am - 9:30pm",
                    "description": "Grab a freshly brewed coffee, a decadent cake and relax in our idyllic cafe. We're part of a larger chain of patisseries and cafes.",
                    "name": "Josie's Cafe Brighton",
                    "phone": "+44 1313 131313"
                }
            },
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -3.319575,
                        52.517827
                    ]
                },
                "type": "Feature",
                "properties": {
                    "category": "cafe",
                    "hours": "8am - 9:30pm",
                    "description": "Come in and unwind at this idyllic cafe with fresh coffee and home made cakes. We're part of a larger chain of patisseries and cafes.",
                    "name": "Josie's Cafe Newtown",
                    "phone": "+44 1414 141414"
                }
            },
            {
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        1.158167,
                        52.071634
                    ]
                },
                "type": "Feature",
                "properties": {
                    "category": "cafe",
                    "hours": "8am - 9:30pm",
                    "description": "Fresh coffee and delicious cakes in an snug cafe. We're part of a larger chain of patisseries and cafes.",
                    "name": "Josie's Cafe Ipswich",
                    "phone": "+44 1717 17171"
                }
            }
        ]
    })
})


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

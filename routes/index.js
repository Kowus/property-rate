var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    use_code = require('../models/use-code'),
    Sanitation = require('../models/sanitation'),
    Area = require('../models/area'),
    User = require('../models/user'),
    async = require('async'),
    Property = require('../models/property'),
    UseCode = require('../models/use'),
    Bill = require('../models/bills'),
    momo = require('../lib/pay'),
    Trans = require('../models/transactions'),
    Ticket =require('../models/ticket'),
    Billy = require('../lib/bill')
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
                Bill.aggregate(
                    {
                        $group: {
                            _id: {year: {$year: '$createdAt'}},
                            total_expected: {$sum: '$total'},
                            total_paid: {$sum: '$paid'}
                        }
                    }
                ).exec(function (err, bill) {
                    if (err) return callback(err);
                    callback(null, bill);
                });
            },
            function (callback) {
                Property.aggregate(
                    {
                        $group: {
                            _id: {
                                month: {
                                    $month: '$createdAt'
                                }, year: {
                                    $year: '$createdAt'
                                }
                            }, count: {$sum: 1}
                        }
                    }
                ).exec(function (err, props) {
                    if (err) return callback(err);
                    callback(null, props);
                });
            }
        ], (err, results) => {
            if (err) {
                console.error(err);
                res.render('index', {
                    title: 'Property Rate',
                    no_users: results[0],
                    no_props: results[1],
                    tot_bill: results[2],
                    prop_trend: results[3],
                    message: 'Error Occurred:' + err
                });
            }
            console.log(results);
            res.render('index', {
                title: 'Property Rate',
                no_users: results[0],
                no_props: results[1],
                tot_bill: results[2],
                prop_trend: results[3]
            });
        }
    );
});
router.get('/generate-bills', function (req, res, next) {
    Billy.generateBills()
        .then(response => {
            res.render('bills', {count:response.length})
        }).catch(err => {
        res.json(err);
    });
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

router.get('/area_search', function (req, res, next) {
    res.render('search-area');
});
router.get('/search_by_area', function (req, res, next) {
    Area.findOne({_id: req.query.term}).populate({
        path: 'properties',
        populate: [
            {
                path: 'use_code'
            }, {
                path: 'sanitation_code'
            }, {
                path: 'owner', select: 'displayName email',
                populate: [
                    {path: 'bill'}
                ]
            }
        ]
    }).exec(function (err, area) {
        if (err) return res.send(err);
        res.render('areas', {term: area.name, area: area});
        // res.json(area)
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
router.get('/pay', function (req, res, next) {
    let query = req.query.bill,
        err_mess = req.query.err||null,
        inAm = req.query.inAm ||null
    ;

    Bill.findOne({_id: query})
        .populate({
            path: 'owner',
            populate: [
                {
                    path: 'ticket'
                }
            ]

        })
        .exec(function (err, bill) {
            if (err) {
                console.error(err);
                return res.send(err);
            }
            res.render('pay', {bill: bill, message:err_mess, inAm:inAm});
        });
});

router.post('/pay', function (req, res, next) {
    let num = req.body.phone;
    if (num[0] == '0') {
        let newNum = num.split('');
        newNum.shift();
        num = newNum.join('');
    }
    let customer = {
        amount: Number(req.body.amount),
        channel: req.body.channel,
        email: req.body.email,
        phone: '233' + num,
        displayName: req.body.name,
        bill: req.body.bill
    };
    console.log('customer');
    momo.receive(customer).then(function (data) {
        console.log(data);
        res.send(data);
    }).catch(function (err) {
        console.log(err);
        res.send(err);
    })
    ;
});

router.post('/pay/mobilemoney', function (req, res, next) {
    console.log(req.body);
    res.status(200).end();
});

router.post('/pay/ticket', isUserTicket, function (req, res, next) {
    res.json(req.body)
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

router.get('/geoJson', function (req, res, next) {
    console.log(req.query);
    let user_id = req.query.user;
    Property.find({owner: user_id})
        .populate('sanitation_code use_code area')
        .exec(
            function (err, props) {
                if (err) return res.json(err);
                // console.log(props)
                let feats = {
                    type: 'FeatureCollection',
                    features: []
                };
                props.forEach(function (item) {
                    feats.features.push({
                        geometry: {
                            type: 'Point',
                            coordinates: [
                                item.location.x,
                                item.location.y
                            ]
                        },
                        type: 'Feature',
                        properties: {
                            category: item.use_code.code,
                            name: item.prop_num,
                            area: item.area.name,
                            description: item.location.description,
                            use_code: item.use_code.name,
                            sanitation_code: item.sanitation_code.name
                        }
                    });
                });
                // console.log(feats)
                res.json(feats);
            }
        );
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

function isUserTicket(req, res, next) {
    if (req.body.amount&&req.body.amount<1)return res.redirect(`/pay?inAm=${req.body.amount}&bill=${req.body.bill}&err=Amount must be ¢ 1.00 or greater ...`)
    Bill.findOne({_id: req.body.bill})
        .populate({
            path: 'owner',
            populate: [
                {
                    path: 'ticket'
                }
            ]
        }).exec((err, bill) => {
        if (err){
            console.error(err);
            return res.redirect(`/pay?inAm=${req.body.amount}&bill=${req.body.bill}&err=${err.message}`)
        }
        if (bill.owner.ticket._id == req.body.ticket) {
            Ticket.findOne({
                _id:req.body.ticket
            }).exec((err, ticket)=>{
                if(err) {
                    console.error(err);
                    return res.redirect(`/pay?inAm=${req.body.amount}&bill=${req.body.bill}&err=${err.message}`);
                }
                if (ticket.balance >= req.body.amount){
                    return next();
                }
                else  return res.redirect(`/pay?inAm=${req.body.amount}&bill=${req.body.bill}&err=Sorry, you don't have enough funds for this operation.`);
            });

        }
        else return res.redirect(`/pay?inAm=${req.body.amount}&bill=${req.body.bill}&err=Ticket doesn't belong to this user. I'll call the cops on you!`);
    });
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

function round_number(value, places) {
    if (places) {
        var pow = Math.pow(10, places);
        return Math.round(value, pow) / pow;
    } else {
        return Math.round(value * 100) / 100;
    }
}

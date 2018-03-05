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
    Ticket = require('../models/ticket'),
    Billy = require('../lib/bill'),
    mailer = require('../config/sendmail')
    ;

/* GET home page. */
router.get('/', isLoggedIn, function (req, res, next) {
    if (req.user.group === 'user') return res.redirect('/users/' + req.user._id);

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
                            _id: { year: { $year: '$createdAt' } },
                            total_expected: { $sum: '$total' },
                            total_paid: { $sum: '$settled' }
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
                            }, count: { $sum: 1 }
                        }
                    }, {
                        $sort: {
                            _id: 1
                        }
                    }
                ).exec(function (err, props) {
                    if (err) return callback(err);
                    callback(null, props);
                    props.forEach(item => {
                        console.log(item._id);
                    });
                });
            }
        ], (err, results) => {
            if (err) {
                console.error(err);
                console.log(results[3]);
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
router.get('/generate-bills', needsGroup('admin'), function (req, res, next) {
    Billy.generateBills()
        .then(response => {
            // res.render('bills', {count: response.length});
            res.redirect('/');
        }).catch(err => {
            res.redirect('/');
        });
});
router.get('/reset-password', isNotLoggedIn, function (req, res, next) {
    res.render('reset', { acc_zone: true });
});
router.post('/reset-password', isNotLoggedIn, function (req, res, next) {
    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) return res.render('reset', { acc_zone: true, message: 'Sorry, an unknown error occurred' });
        if (user) {
            mailer.reset(user);
            res.render('reset', { acc_zone: true, message: 'An email has been sent to your inbox. ' + req.body.email });
        } else {
            res.render('reset', { acc_zone: true, message: 'No user found with email: ' + req.body.email });
        }
    });
});
router.get('/reset', isNotLoggedIn, function (req, res, next) {
    User.findOne({ _id: req.query.id }, function (err, user) {
        if (err) return res.status(403).send('Unauthorized');
        if (!user) return res.status(403).send('Unauthorized');
        else {
            res.render('new_password', { forg: user });
        }
    }
    );
});
router.post('/reset', isNotLoggedIn, function (req, res, next) {
    User.findOne({ _id: req.body._id }, function (err, user) {
        if (err) {
            console.error(err);
            return res.render('new_password', {
                message: "Sorry, we couldn't change your password",
                forg: { _id: req.body._id }
            });
        }
        if (user) {
            if (req.body.password != req.body.cpassword) return res.render('new_password', {
                message: 'Password do not match',
                forg: { _id: req.body._id }
            });
            user.password = req.body.password;
            console.log(user);
            user.save(function (err, us) {
                if (err) {
                    console.error(err);
                    return res.render('new_password', {
                        message: "Sorry, we couldn't change your password",
                        forg: { _id: req.body._id }
                    });
                }
                mailer.password(us);
                console.log(us);
                req.session.sucmess = 'Password successfully reset.';
                res.redirect('/logout');
            });
        }
    });
});
router.get('/change-password', isLoggedIn, function (req, res, next) {
    res.render('password', { acc_zone: true });
});
router.post('/change-password', isLoggedIn, function (req, res, next) {

    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            console.error(err);
            return res.render('password', { message: "Sorry, we couldn't change your password" });
        }
        if (user) {
            user.comparePassword(req.body.opassword, function (err, isMatch) {
                if (err) {
                    console.error(err);
                    return res.render('password', { message: "Sorry, we couldn't change your password" });
                }
                if (isMatch) {
                    console.log(isMatch);
                    if (req.body.password != req.body.cpassword) return res.render('password', { message: 'Password do not match' });
                    user.password = req.body.password;
                    console.log(user);
                    user.save(function (err, us) {
                        if (err) {
                            console.error(err);
                            return res.render('password', { message: "Sorry, we couldn't change your password" });
                        }
                        mailer.password(us);
                        console.log(us);
                        req.session.sucmess = 'Password changed successfully';
                        res.redirect('/logout');
                    });

                } else {
                    return res.render('password', { message: "Sorry, wrong old password." });
                }

            });
        }
    });

});
router.get('/login', isNotLoggedIn, function (req, res, next) {
    res.render('login', {
        title: 'Property Rate Login.',
        message: req.flash('loginMessage'),
        acc_zone: true,
        success_message: req.session.sucmess || null
    });
    req.session.sucmess = null;
});
router.get('/signup', isNotLoggedIn, function (req, res, next) {
    res.render('signup', { title: 'Property Rate Signup.', message: req.flash('signupMessage'), acc_zone: true });
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

router.get('/area_search', needsGroup('admin'), function (req, res, next) {
    res.render('search-area');
});
router.get('/search_by_area', needsGroup('admin'), function (req, res, next) {
    Area.findOne({ _id: req.query.term }).populate({
        path: 'properties',
        populate: [
            {
                path: 'use_code'
            }, {
                path: 'sanitation_code'
            }, {
                path: 'owner', select: 'displayName email',
                populate: [
                    { path: 'bill' }
                ]
            }
        ]
    }).exec(function (err, area) {
        if (err) return res.send(err);
        res.render('areas', { term: area.name, area: area });
        // res.json(area)
    });
});
router.get('/search_user', needsGroup('admin'), function (req, res) {
    var regex = new RegExp(req.query["term"], 'i');
    var query = User.find(
        {
            $or: [
                { givenName: regex },
                { familyName: regex }
            ]
        });

    query.exec(function (err, users) {
        if (!err) {

            res.render('users', { users: users, term: req.query.term });
        } else {

            res.render('error', {
                error: { stack: "Couldn't find user", status: err.status || 500 },
                message: err.message
            });
        }
    });
});
router.get('/pay', isLoggedIn, function (req, res, next) {
    let query = req.query.bill,
        err_mess = req.query.err || null,
        inAm = req.query.inAm || null
        ;

    Bill.findOne({ _id: query })
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
            res.render('pay', { bill: bill, message: err_mess, inAm: inAm });
        });
});

router.post('/pay', isNotLoggedIn, function (req, res, next) {
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
    let newTrans = new Trans({
        bill: req.body.bill,
        amount: req.body.amount,
        owner: req.body.owner
    });
    newTrans.save(function (err, transaction) {
        if (err) {
            console.error(err);
            return res.redirect(`/pay?inAm=${req.body.amount}&bill=${req.body.bill}&err=${err.message}`);
        }
        User.findOneAndUpdate({ _id: req.body.owner }, {
            $push: {
                transactions: {
                    $position: 0,
                    $each: [transaction._id]
                }
            }
        }, err => {
            if (err) return res.redirect(`/pay?inAm=${req.body.amount}&bill=${req.body.bill}&err=${err.message}`);
            Bill.findOneAndUpdate({ _id: req.body.bill },
                {
                    $push: {
                        transactions: {
                            $position: 0,
                            $each: [transaction._id]
                        }
                    },
                    $inc: {
                        settled: req.body.amount
                    }
                },
                function (err, bill) {
                    if (err) return res.redirect(`/pay?inAm=${req.body.amount}&bill=${req.body.bill}&err=${err.message}`);
                    Ticket.findOneAndUpdate({
                        _id: req.body.ticket
                    },
                        {
                            $inc: {
                                balance: -req.body.amount
                            }
                        }, function (err) {
                            if (err) return res.redirect(`/pay?inAm=${req.body.amount}&bill=${req.body.bill}&err=${err.message}`);
                            transaction.approved = true;
                            transaction.save(function (err) {
                                if (err) return res.redirect(`/pay?inAm=${req.body.amount}&bill=${req.body.bill}&err=${err.message}`);
                                if ((Number(bill.settled) + Number(req.body.amount)) >= Number(bill.total)) {
                                    Bill.findOneAndUpdate({ _id: req.body.bill }, {
                                        $set: {
                                            paid: true
                                        }
                                    }, function (err) {
                                        if (err) {
                                            return res.redirect(`/pay?inAm=${req.body.amount}&bill=${req.body.bill}&err=${err.message}`);
                                        } else {
                                            req.session.transtat = true;
                                            req.session.transid = transaction._id;
                                        }
                                        res.redirect('/users/' + req.body.owner);
                                    });

                                }
                                else {
                                    req.session.transtat = true;
                                    req.session.transid = transaction._id;
                                    res.redirect('/users/' + req.body.owner);
                                }
                            });
                        });

                }
            );
        });


    }); // Closes newTrans.save(...)

});

router.post('/getuser', needsGroup('admin'), function (req, res) {
    User.findOne({ _id: req.body.user }, { displayName: 1 }, function (err, user) {
        if (err) return res.status(400).end();
        res.json(user);
    });
});

router.get('/defaulters', needsGroup('admin'), function (req, res) {
    Bill.aggregate(
        {
            $match: {
                paid: false
            }
        }, {
            $project: {
                owner: '$owner',
                properties: '$properties',
                createdAt: '$createdAt',
                total: '$total',
                settled: '$settled'
            }
        }, {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    owner: '$owner',
                    properties: '$properties',
                    total: { $subtract: ['$total', '$settled'] }
                }
            }
        }
    ).exec(function (err, bill) {
        if (err) { console.error(err); return res.send('an error occured'); }
        console.log(bill);
        res.render('deff', { defaulters: bill });
    });
});

router.get('/search_area', function (req, res) {
    console.log(req.query);
    var regex = new RegExp(req.query.term, 'i');
    console.log(regex);
    var query = Area.find(
        {
            $or: [
                { code: regex },
                { name: regex }
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
                { code: regex },
                { name: regex }
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
                { code: regex },
                { name: regex }
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
    Property.find({ owner: user_id })
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
                    console.log(item);
                    let arr = item.area || null;
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


router.get('/billdates', needsGroup('admin'), function (req, res, next) {
    Bill.aggregate(
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                properties: {
                    owner: '$owner'
                }
            }
        }
    ).exec((err, bills) => {
        if (err) return res.send(err);
        res.json(bills);
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

function isUserTicket(req, res, next) {
    if (req.body.amount && req.body.amount < 1) return res.redirect(`/pay?inAm=${req.body.amount}&bill=${req.body.bill}&err=Amount must be ¢ 1.00 or greater ...`);
    Bill.findOne({ _id: req.body.bill })
        .populate({
            path: 'owner',
            populate: [
                {
                    path: 'ticket'
                }
            ]
        }).exec((err, bill) => {
            if (err) {
                console.error(err);
                return res.redirect(`/pay?inAm=${req.body.amount}&bill=${req.body.bill}&err=${err.message}`);
            }
            if (bill.owner.ticket._id == req.body.ticket && (bill.owner._id == req.user._id || req.user.group == 'admin')) {
                Ticket.findOne({
                    _id: req.body.ticket
                }).exec((err, ticket) => {
                    if (err) {
                        console.error(err);
                        return res.redirect(`/pay?inAm=${req.body.amount}&bill=${req.body.bill}&err=${err.message}`);
                    }
                    if (ticket.balance >= req.body.amount) {
                        return next();
                    }
                    else return res.redirect(`/pay?inAm=${req.body.amount}&bill=${req.body.bill}&err=Sorry, you don't have enough funds for this operation.`);
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

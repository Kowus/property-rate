var express = require('express'),
    router = express.Router(),
    passport = require('passport')
;

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.user){
        console.log(req.user)
    }
  res.render('index', { title: 'Property Rate' });
  //   res.redirect('/login')
});
router.get('/login',isNotLoggedIn, function (req, res, next) {
    res.render('login', {title:'Property Rate Login.', message:req.flash('loginMessage')})
});
router.get('/signup', isNotLoggedIn,function (req, res, next) {
    res.render('signup', {title:'Property Rate Signup.', message:req.flash('signupMessage')})
});
router.get('/profile', isLoggedIn, function (req, res, next) {
    let next_page = req.session.next || '/';
    res.redirect(next_page);
});

router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
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

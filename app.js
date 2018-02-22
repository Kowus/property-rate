require('dotenv').config();
var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    env = require('./config/env'),
    session = require('express-session'),
    flash = require('connect-flash'),
    mongoose = require('mongoose'),
    redis = require('redis').createClient(env.redis.url, {no_ready_check: true}),
    RedisStore = require('connect-redis')(session),
    helmet =require('helmet'),
    hbs = require('hbs')
;
mongoose.connect(env.database.url, {
    useMongoClient: true,
    promiseLibrary: require('bluebird')
});

var index = require('./routes/index');
var users = require('./routes/users');
var properties = require('./routes/properties');

var app = express();
app.use(helmet());
hbs.registerPartials('./views/partials');
app.locals.title='P R M A';
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
require('./config/passport')(passport);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    resave: false,
    saveUninitialized:true,
    secret: env.session.secret,
    store:new RedisStore({client:redis})
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    if (req.user.group == 'user') res.locals.acc_zone=true;
    next();
});

app.use('/', index);
app.use('/users',isLoggedIn, users);
app.use('/property',isLoggedIn, properties);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {status:err.status||500, stack:"Couldn't find the requested resource."};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection connected');
});
mongoose.connection.on('error', function (err) {
    console.log('Mongoose default connection error:' + err);
});
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.log("Mongoose default connection disconnected on app termination");
        process.exit(0);
    });
});


module.exports = app;
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

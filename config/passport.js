/*
 * property-rate ==> passport
 * Created By barnabasnomo on 1/20/18 at 8:11 PM
 * @soundtrack Come And See Me - Partynextdoor feat. Drake
*/

const LocalStrategy = require('passport-local').Strategy,
    env = require('./env');
let User = require('../models/user');

module.exports = function (passport) {
    passport.serializeUser(function (req, user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (req, id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    
//    User Signup
    passport.use('local-signup', new LocalStrategy({
        usernameField:'email',
        passwordField:'password',
        passReqToCallback:true
    },
        function (req, email, password, done) {
            process.nextTick(function () {
                User.findOne({email:email}, function (err, user) {
                    if (err) return done(err);
                    if (user){
                        return done (null, false, req.flash('signupMessage','That email has already been used with an account.'));
                    } else {
                        if(req.body.password!==req.body.cpassword){
                            return done(null, false, req.flash('signupMessage', 'Passwords do not match'));

                        }
                        let newUser = new User({
                            givenName: req.body.givenName,
                            familyName: req.body.familyName,
                            email: req.body.email,
                            password: req.body.password,
                            gender: req.body.gender
                        });

                        newUser.save(function (err, user) {
                            if(err){
                                console.log(err);
                                return done(null, false, req.flash('signupMessage', "Couldn't create your account."));
                            }
                            return done(null,user);

                        })
                    }
                })
            })
        }
        ));
    
    
//    User Login
    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {
            //	If user exists
            User.findOne({email: email.toLowerCase()}, function (err, user) {
                if (err) return done(err);
                //	If user doesn't exist
                if (!user) return done(null, false, req.flash('loginMessage', 'No user found'));

                //	If user found but password is wrong
                user.comparePassword(req.body.password, function (err, isMatch) {
                    if (isMatch && !err) {
                        return done(null, user);
                    }
                    else {
                        return done(null, false, req.flash('loginMessage', 'Email or Password incorrect'));
                    }
                });

            });
        }
    ));
};
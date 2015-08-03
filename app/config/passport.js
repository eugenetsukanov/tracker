module.exports = function (passport) {

    var LocalStrategy = require('passport-local').Strategy,
        GoogleStrategy = require('passport-google').Strategy,
        TwitterStrategy = require('passport-twitter').Strategy,
        FacebookStrategy = require('passport-facebook').Strategy;

    var User = require('./../models/user');

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, '-local.passwordHashed -local.passwordSalt', function(err, user) {
            done(err, user);
        });
    });

    passport.use(new LocalStrategy({
            passReqToCallback : true,
            failureFlash: true
        },
        function(req, username, password, done) {

            var query = {
                $or: [
                    {'email': username},
                    {'local.username': username}
                ]
            };

            User.findOne(query, function(err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, req.flash('loginMessage', 'User \''+username+'\' is not registered'));
                }
                if (!user.validPassword(password)) {
                    return done(null, false, req.flash('loginMessage', 'Wrong password'));
                }
                return done(null, user);
            });
        }
    ));


    passport.use(new GoogleStrategy({
            returnURL: 'http://localhost:3000/auth/google/return',
            realm: 'http://localhost:3000/'
        },
        function(identifier, profile, done) {
            User.findOrCreate({ openId: identifier }, function(err, user) {
                done(err, user);
            });
        }
    ));





};
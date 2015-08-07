module.exports = function (passport) {

    var LocalStrategy = require('passport-local').Strategy,
        GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
        TwitterStrategy = require('passport-twitter').Strategy,
        FacebookStrategy = require('passport-facebook').Strategy;

    var User = require('./../models/user');

    var configAuth = require('./auth');

    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, '-local.passwordHashed -local.passwordSalt', function (err, user) {
            done(err, user);
        });
    });

    passport.use(new LocalStrategy({
            passReqToCallback: true,
            failureFlash: true
        },
        function (req, username, password, done) {

            var query = {
                $or: [
                    {'email': username},
                    {'local.username': username}
                ]
            };

            User.findOne(query, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, req.flash('loginMessage', 'User \'' + username + '\' is not registered'));
                }
                if (!user.validPassword(password)) {
                    return done(null, false, req.flash('loginMessage', 'Wrong password'));
                }
                return done(null, user);
            });
        }
    ));

    //---------------------Google

    passport.use(new GoogleStrategy({
            clientID: configAuth.googleAuth.clientID,
            clientSecret: configAuth.googleAuth.clientSecret,
            callbackURL: configAuth.googleAuth.callbackURL
        },
        function (accessToken, refreshToken, profile, done) {
            process.nextTick(function () {

                User.findOne({'google.id': profile.id}, function (err, user) {

                    if (err) {
                        return done(err);
                    }
                    if (!user) {

                        var newUser = new User();
                        newUser.google.id = profile.id;
                        newUser.google.name = profile.displayName;
                        newUser.google.token = accessToken;
                        newUser.email = profile.emails[0].value;
                        newUser.first = profile.displayName.split(' ')[0];
                        newUser.last = profile.displayName.split(' ')[1];


                        newUser.save(function (err) {
                            if (err) console.log(err);
                            return done(err, newUser);
                        });
                    } else {
                        return done(err, user);
                    }

                });
            });

        }
    ));


    //---------------------Facebook

    passport.use(new FacebookStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            //enableProof: false,
            profileFields: ['id', 'displayName', 'emails']
        },
        function (accessToken, refreshToken, profile, done) {
            console.log(arguments)

            process.nextTick(function () {

                User.findOne({'facebook.id': profile.id}, function (err, user) {

                    if (err) {
                        return done(err);
                    }

                    if (!user) {

                        var newUser = new User();
                        newUser.facebook.id = profile.id;
                        newUser.facebook.name = profile.displayName;
                        newUser.facebook.token = accessToken;
                        newUser.email = profile.emails[0].value;
                        newUser.first = profile.displayName.split(' ')[0];
                        newUser.last = profile.displayName.split(' ')[1];

                        newUser.save(function (err) {
                            if (err) console.log(err);
                            return done(err, newUser);
                        });
                    } else {
                        return done(err, user);
                    }

                });
            })

        }
    ));


    //---------------------Twitter

    passport.use(new TwitterStrategy({
            consumerKey: configAuth.twitterAuth.consumerKey,
            consumerSecret: configAuth.twitterAuth.consumerSecret,
            callbackURL: configAuth.twitterAuth.callbackURL
        },

        function (token, tokenSecret, profile, done) {
            
            process.nextTick(function () {

                User.findOne({'twitter.id': profile.id}, function (err, user) {

                    if (err) {
                        return done(err);
                    }

                    if (!user) {

                        var newUser = new User();
                        newUser.twitter.id = profile.id;
                        newUser.twitter.name = profile.displayName;
                        newUser.twitter.token = token;
                        //newUser.email = profile.emails[0].value;
                        newUser.first = profile.displayName.split(' ')[0];
                        newUser.last = profile.displayName.split(' ')[1];

                        newUser.save(function (err) {
                            if (err) console.log(err);
                            return done(err, newUser);
                        });
                    } else {
                        return done(err, user);
                    }

                });

            })

        }

    ));

};
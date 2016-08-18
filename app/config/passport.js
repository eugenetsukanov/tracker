module.exports = function (passport) {

    var LocalStrategy = require('passport-local').Strategy,
        GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
        TwitterStrategy = require('passport-twitter').Strategy,
        FacebookStrategy = require('passport-facebook').Strategy;

    // @@@slava organised passport
    var application = require('./application');
    var Container = application.container;

    var Config = Container.get('config').get();
    var User = Container.get('User');
    var Host = Container.get('Host');

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
            clientID: Config.googleAuth.clientID,
            clientSecret: Config.googleAuth.clientSecret,
            callbackURL: Host.getUrl(Config.googleAuth.callbackURL),
            passReqToCallback: true
        },
        function (req, accessToken, refreshToken, profile, done) {
            if (!req.user) {

                var query = {
                    $or: [
                        {'google.id': profile.id},
                        {'google.email': profile.emails[0].value}
                    ]
                };

                User.findOne(query, function (err, user) {
                    if (err) return done(err);

                    if (!user) {

                        var newUser = new User();
                        newUser.google.id = profile.id;
                        newUser.google.token = accessToken;
                        newUser.google.email = profile.emails[0].value;
                        newUser.email = profile.emails[0].value;
                        newUser.first = profile.displayName.split(' ')[0];
                        newUser.last = profile.displayName.split(' ')[1];

                        newUser.save(function (err) {
                            if (err) return done(err);
                            return done(err, newUser);
                        });
                    } else {
                        return done(err, user);
                    }

                });
            } else {

                req.user.google.id = profile.id;
                req.user.google.token = accessToken;
                req.user.google.email = profile.emails[0].value;
                req.user.email = req.user.email ||  profile.emails[0].value;
                req.user.first = req.user.first || profile.displayName.split(' ')[0];
                req.user.last = req.user.last || profile.displayName.split(' ')[1];
                req.user.save(function (err) {
                    if (err) return done(err);
                    return done(err, req.user);
                });
            }

        }
    ));

    //---------------------Facebook

    passport.use(new FacebookStrategy({
            clientID: Config.facebookAuth.clientID,
            clientSecret: Config.facebookAuth.clientSecret,
            callbackURL: Host.getUrl(Config.facebookAuth.callbackURL),
            profileFields: ['id', 'displayName', 'emails'],
            passReqToCallback: true
        },
        function (req, accessToken, refreshToken, profile, done) {

            if (!req.user) {

                var query = {
                    $or: [
                        {'facebook.id': profile.id},
                        {'facebook.email': profile.emails[0].value}
                    ]
                };

                User.findOne(query, function (err, user) {
                    if (err) return done(err);

                    if (!user) {

                        var newUser = new User();
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = accessToken;
                        newUser.facebook.email = profile.emails[0].value;
                        newUser.email = profile.emails[0].value;
                        newUser.first = profile.displayName.split(' ')[0];
                        newUser.last = profile.displayName.split(' ')[1];

                        newUser.save(function (err) {
                            if (err) return done(err);
                            return done(err, newUser);
                        });
                    } else {
                        return done(err, user);
                    }

                });

            } else {
                req.user.facebook.id = profile.id;
                req.user.facebook.token = accessToken;
                req.user.facebook.email = profile.emails[0].value;
                req.user.email = req.user.email ||  profile.emails[0].value;
                req.user.first = req.user.first || profile.displayName.split(' ')[0];
                req.user.last = req.user.last || profile.displayName.split(' ')[1];

                req.user.save(function (err) {
                    if (err) return done(err);
                    return done(err, req.user);
                });
            }

        }
    ));


    //---------------------Twitter

    passport.use(new TwitterStrategy({
            consumerKey: Config.twitterAuth.consumerKey,
            consumerSecret: Config.twitterAuth.consumerSecret,
            callbackURL: Host.getUrl(Config.twitterAuth.callbackURL),
            passReqToCallback: true
        },

        function (req, token, tokenSecret, profile, done) {

            if (!req.user) {

                User.findOne({'twitter.id': profile.id}, function (err, user) {

                    if (err) return done(err);

                    if (!user) {

                        var newUser = new User();
                        newUser.twitter.id = profile.id;
                        newUser.twitter.token = token;
                        newUser.first = profile.displayName.split(' ')[0];
                        newUser.last = profile.displayName.split(' ')[1];

                        newUser.save(function (err) {
                            if (err) return done(err);
                            return done(err, newUser);
                        });

                    } else {
                        return done(err, user);
                    }

                });

            } else {
                req.user.twitter.id = profile.id;
                req.user.twitter.token = token;
                req.user.first = req.user.first || profile.displayName.split(' ')[0];
                req.user.last = req.user.last || profile.displayName.split(' ')[1];

                req.user.save(function (err) {
                    if (err) return done(err);
                    return done(err, req.user);
                });
            }


        }
    ));

};
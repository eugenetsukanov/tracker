module.exports = function (passport) {

    var LocalStrategy = require('passport-local').Strategy,
        GoogleStrategy = require('passport-google').Strategy,
        TwitterStrategy = require('passport-twitter').Strategy,
        FacebookStrategy = require('passport-facebook').Strategy;

    var User = require('./../models/user');

    var configAuth = require('./auth');

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

    //---------------------Google

    passport.use(new GoogleStrategy({
            returnURL: configAuth.googleAuth.callbackURL,
            realm: 'http://localhost:3000/'
        },
        function(identifier, profile, done) {
            User.findOrCreate({ openId: identifier }, function(err, user) {
                done(err, user);
            });
        }
    ));


    //---------------------Facebook

    passport.use(new FacebookStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            enableProof: false
        },
        function(accessToken, refreshToken, profile, done) {
            User.findOne({ 'facebook.id': profile.id }, function (err, user) {

                if (err) {
                    return done(err);
                }
                console.log(profile);
                //No user was found... so create a new user with values from Facebook (all the profile. stuff)
                if (!user) {

                    user = new User({
                        'facebook.profileId': profile.id,
                        first: profile.displayName,
                        //email: profile.emails[0].value,
                        //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
                        facebook: profile._json
                    });

                    user.save(function(err) {
                        if (err) console.log(err);
                        return done(err, user);
                    });
                } else {
                    return done(err, user);
                }

            });
        }
    ));


    //---------------------Twitter

    //passport.use(new TwitterStrategy({
    //        consumerKey: configAuth.twitterAuth.clientID,
    //        consumerSecret: configAuth.twitterAuth.consumerSecret,
    //        callbackURL: configAuth.twitterAuth.callbackURL
    //    },
    //    function(token, tokenSecret, profile, done) {
    //        User.findOrCreate({ twitterId: profile.id }, function (err, user) {
    //            return done(err, user);
    //        });
    //    }
    //));

};
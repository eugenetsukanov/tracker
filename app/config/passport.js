module.exports = function (passport) {

    var LocalStrategy = require('passport-local').Strategy;
    var User = require('./../models/user');

    // passport
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
            User.findOne({ 'local.username': username }, function(err, user) {
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

};
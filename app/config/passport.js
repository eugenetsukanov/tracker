module.exports = function (passport) {

    var LocalStrategy = require('passport-local').Strategy;
    var User = require('./../models/user');

    var checkEmail = function(email) {
        var regular = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return regular.test(email);
    };

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, '-local.passwordHashed -local.passwordSalt', function(err, user) {
            done(err, user);
        });
    });

    passport.use(new LocalStrategy(
        function(username, password, done) {

            var request = checkEmail(username) ? {'email': username} : {'local.username':username};

            User.findOne(request, function(err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if (!user.validPassword(password)) {
                    return done(null, false, { message: 'Incorrect password.' });
                }
                return done(null, user);
            });
        }
    ));

};
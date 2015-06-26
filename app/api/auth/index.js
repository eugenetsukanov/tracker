module.exports = function (app, passport) {

    var User = require('../../models/user');

    app.post('/api/login',
        passport.authenticate('local', {successRedirect: '/api/users/me'})
    );

    app.post('/api/logout', function (req, res) {
        req.logout();
        res.sendStatus(200);
    });

    app.post('/api/register', function (req, res, next) {

        User.findOne({'local.username': req.body.username}, function (err, user) {
            if (err) return next(err);

            var o = false;

            if (user) {
                o = true;
            }

            if (!o) {
                var user = new User({
                    local: {
                        username: req.body.username,
                        password: req.body.password
                    }
                });

                user.save(function (err) {
                    req.login(user, function (err) {
                        if (err) return next(err);
                        res.redirect('/api/users/me');
                    });
                });
            } else {
                //res.redirect('/api/register');
                res.sendStatus(403);
            }
        });
    });

    app.use('/api', function (req, res, next) {
        if (!req.user) return res.sendStatus(401);
        next();
    });

    app.get('/api/users/me', function (req, res) {
        User.findOne({_id: req.user._id}, '-local.passwordHashed -local.passwordSalt', function (err, user) {
            res.json(user);
        });
    });

    app.get('/api/users', function (req, res) {
        User.find({}, '-local.passwordHashed -local.passwordSalt', function (err, users) {
            res.json(users);
        });

    });

    //app.post('/api/users/me', function (req, res) {
    //    User.hash(req.body.)
    //})

};
module.exports = function (app, passport) {

    var User = require('../../models/user');
    var form = require("express-form"),
        field = form.field;

    var UserForm = form(
        field("local.firstName").trim(),
        field("local.lastName").trim(),
        field("local.email").trim().required().isEmail()
    );

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

    app.put('/api/users/me', UserForm, function (req, res, next) {

        if (req.form.isValid) {

            User.findById(req.body._id, function (err, user) {
                if (err) return next(err);

                user.local.firstName = req.form.local.firstName;
                user.local.lastName = req.form.local.lastName;
                user.local.email = req.form.local.email;

                user.save(function (err, user) {
                    if (err) return next(err);
                    res.json(user);
                });
            });
        }
        else {
            res.status(400).json(req.form.errors);
        }

    })

};
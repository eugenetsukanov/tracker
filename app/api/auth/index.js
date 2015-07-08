module.exports = function (app, passport, flash) {

    var Tokenizer = app.container.get('Tokenizer');
    var Mailer = app.container.get('Mailer');
    var Host = app.container.get('Host');

    var User = require('../../models/user');
    var form = require("express-form"),
        field = form.field;

    var UserForm = form(
        field("first").trim(),
        field("last").trim(),
        field("email").trim().required().isEmail()
    );

    app.post('/api/users/resetPassword', function (req, res, next) {

        Tokenizer.decode(req.query.token, function (err, decoded) {
            if (err) return next(err);

            User.findById(decoded.userId, '-local.passwordHashed -local.passwordSalt', function (err, user) {
                if (err) return next(err);

                user.local.password = req.query.password;

                user.save(function (err, user) {
                    if (err) return next(err);
                    res.json(user);
                });
            });

        });

    });

    app.post('/api/login', function (req, res, next) {
            passport.authenticate('local', function(err, user, info) {
                if (err) return next(err);

                if (!user) return res.status(403).send(req.flash('loginMessage'));

                req.logIn(user, {failureFlash: true}, function(err) {
                    if (err) return next(err);
                    return res.redirect('/api/users/me');
                });
            })(req, res, next);
        }
    );

    app.post('/api/logout', function (req, res) {
        req.logout();
        res.sendStatus(200);
    });

    app.post('/api/resetPassword', function (req, res, next) {


        User.findOne({'email': req.body.email}, function (err, user) {

            if (err) return next(err);

            if (!user) {
                return res.sendStatus(400);
            }

            Tokenizer.encode({userId: user._id}, function (err, token) {

                var mailSettings = {
                    to: user.email,
                    subject: 'Password reset',
                    text: Host.getUrl('/#/public/change-password/' + token)
                };

                if (err) return res.sendStatus(400);

                Mailer.send(mailSettings, function (err) {
                    if (err) next(err);
                    res.sendStatus(200);
                });


            });
        });

    });

    app.post('/api/register', function (req, res, next) {

        var query = {
            $or: [
                {'email': req.body.email},
                {'local.username': req.body.username}
            ]
        };

        User.findOne(query, function (err, user) {
            if (err) return next(err);

            if (!user) {
                var user = new User({
                    email: req.body.email,
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
                var error = (user.email == req.body.email)
                    ? req.body.email + ' already exist'
                    : req.body.username + ' already exist';

                res.status(403).send(error);
            }
        });
    });

    app.use('/api', function (req, res, next) {
        if (!req.user) return res.sendStatus(401);
        next();
    });

    app.get('/api/users/me', function (req, res) {
        res.json(req.user);
    });

    app.get('/api/users', function (req, res) {
        User.find({}, '-local.passwordHashed -local.passwordSalt', function (err, users) {
            res.json(users);
        });

    });

    app.put('/api/users/me', UserForm, function (req, res, next) {
        if (req.form.isValid) {

            req.user.first = req.form.first;
            req.user.last = req.form.last;
            req.user.email = req.form.email;

            req.user.save(function (err, user) {
                if (err) return next(err);
                res.json(user);
            });
        }
        else {
            res.status(400).json(req.form.errors);
        }

    });


    app.post('/api/users/changePassword', function (req, res, next) {

        User.findById(req.user._id, function (err, user) {
            if (user.validPassword(req.query.oldPassword)) {

                user.setPassword(req.query.newPassword);

                user.save(function (err, user) {
                    if (err) return next(err);
                    user.local.passwordSalt = undefined;
                    user.local.passwordHashed = undefined;
                    res.json(user);
                });

            } else {
                res.sendStatus(403);
            }
        });

    });


};
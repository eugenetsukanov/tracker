module.exports = function (app, passport) {

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

    app.post('/api/login',
        passport.authenticate('local', {successRedirect: '/api/users/me'})
    );

    app.post('/api/logout', function (req, res) {
        req.logout();
        res.sendStatus(200);
    });

    app.post('/api/resetPassword', function (req, res, next) {

        var mailSettings = {
            to: user.email,
            subject: 'Password reset',
            text: Host.getUrl('/#/public/change-password/' + token)
        };

        User.findOne({'email': req.body.email}, function (err, user) {

            if (err) return next(err);

            if (!user) {
                return res.sendStatus(400);
            }

            Tokenizer.encode({userId: user._id}, function (err, token) {

                if (err) return res.sendStatus(400);

                Mailer.send(mailSettings);

                res.sendStatus(200);

            });
        });

    });

    app.post('/api/register', function (req, res, next) {

        User.findOne({'local.username': req.body.username}, function (err, user) {
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

            User.findById(req.body._id, '-local.passwordHashed -local.passwordSalt', function (err, user) {
                if (err) return next(err);

                user.first = req.form.first;
                user.last = req.form.last;
                user.email = req.form.email;

                user.save(function (err, user) {
                    if (err) return next(err);
                    res.json(user);
                });
            });
        }
        else {
            res.status(400).json(req.form.errors);
        }

    });


    app.post('/api/users/changePassword', function (req, res, next) {
        User.findById(req.body._id, function (err, user) {

            if (err) return next(err);

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
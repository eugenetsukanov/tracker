module.exports = function (app, passport) {

    var User = require('../../models/user');

    app.post('/api/login',
        passport.authenticate('local', { successRedirect: '/api/users/me' })
    );

    app.post('/api/logout', function (req, res) {
        req.logout();
        res.sendStatus(200);
    });

    app.post('/api/register', function (req, res, next) {

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
    });

    app.use('/api', function (req, res, next) {
        if (!req.user) return res.sendStatus(401);
        next();
    });

    app.get('/api/users/me', function (req, res) {
        res.json(req.user);
    });

};
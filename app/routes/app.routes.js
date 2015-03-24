module.exports = function (app, passport) {

    app.post('/api/login',
        passport.authenticate('local', { successRedirect: '/api/users/me' })
    );

    app.get('/api/logout', function (req, res) {
        req.logout();
        res.sendStatus(200);
    });

    app.use('/api', function (req, res, next) {
        //if (!req.user) return res.sendStatus(403);
        next();
    });

    app.get('/api/users/me', function (req, res) {
        console.log(req.user);
        res.json(req.user);
    });

    require('../api/task')(app);


};
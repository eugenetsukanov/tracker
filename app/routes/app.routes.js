function isLoggedIn(req, res, next) {

    console.log(req.isAuthenticated());
    console.log('1111');

    if (req.isAuthenticated()) return next();

    res.sendStatus(403);
};

module.exports = function (app, passport) {

    app.get('/login', isLoggedIn, function (req, res) {
        res.send(req.user);
    });


//    app.get('/', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));

};
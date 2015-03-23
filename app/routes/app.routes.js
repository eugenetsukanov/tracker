module.exports = function (app, passport) {

    app.post('/api/login',
        passport.authenticate('local', { successRedirect: '/' })
    );

};
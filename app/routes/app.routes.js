module.exports = function (app, passport) {

    require('../api/auth')(app, passport);
    require('../api/task')(app);

};
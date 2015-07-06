module.exports = function (app, passport, nodemailer) {

    require('../api/auth')(app, passport, nodemailer);
    require('../api/task')(app);
    require('../api/report')(app);
    require('../api/files')(app);
    require('../api/user')(app);

};
var Mailer = function (mailerConfig) {

    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: mailerConfig.sender,
            pass: mailerConfig.password
        }
    });

    this.send = function (mail, callback) {
        transporter.sendMail({
            from: mail.from || mailerConfig.sender,
            to: mail.to,
            subject: mail.subject,
            text: mail.text
        }, function (err, info) {
            callback(err, info);
        });
    }
};

module.exports = Mailer;
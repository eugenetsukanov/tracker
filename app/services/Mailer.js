var Mailer = function (sender) {

    var nodemailer = require('nodemailer');
    var emailSender = sender;

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailSender,
            pass: 'xxx666up'
        }
    });

    this.send = function (mail) {
        transporter.sendMail({
            from: mail.from || emailSender,
            to: mail.to,
            subject: mail.subject,
            text: mail.text
        });
    }
};

module.exports = Mailer;
module.exports = function () {
    this.validate = function (req, res, next) {
        if (!req.form) {
            return next(new Error('No form to validate'));
        }

        if (req.form.isValid) {
            next();
        } else {
            res.status(400).json(req.form.getErrors());
        }
    };
};

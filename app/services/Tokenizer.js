var Tokenizer = function (_secret) {

    var jwt = require('jsonwebtoken');

    var secret = _secret || 'tracker';

    this.encode = function (data, next) {
        next(null, jwt.sign(data, secret, {expiresInSeconds: 24*60*60}));
    };

    this.decode = function (token, next) {
        jwt.verify(token,secret, function (err, decoded) {
            next(err, decoded)
        });
    };

};

module.exports = Tokenizer;
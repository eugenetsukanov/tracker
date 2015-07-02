var Tokenizer = function (secret) {

    var jwt = require('jsonwebtoken');

    var secret = secret || 'tracker';

    this.encode = function (data) {
        return jwt.sign(data, secret);
    };

    this.verify = function (token, verified) {
        return jwt.verify(token, secret, {}, verified);
    };

    this.decode = function (token) {
        return jwt.decode(token, {complete: true});
    };

};

module.exports = Tokenizer;
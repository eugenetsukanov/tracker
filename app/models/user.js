var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require("crypto");

var UserSchema = new Schema({

    first: String,
    last: String,
    email: String,
    local: {
        username: {type: String, index: true},
        passwordSalt: String,
        passwordHashed: String
    }

});

function hash(data) {
    return crypto
        .createHash("sha256")
        .update(data)
        .digest("hex");
}

UserSchema.methods = {

    validPassword: function (password) {
        return this.local.passwordHashed === hash(this.local.passwordSalt + password);
    },
    setPassword: function (password) {
        var salt = 'key-' +  Math.random() + ' ' + Math.random() + new Date();
        this.local.passwordSalt = hash(salt);
        this.local.passwordHashed = hash(this.local.passwordSalt + password);

    }

};


UserSchema.virtual('local.password').set(function (password) {
    this.setPassword(password);
});

module.exports = mongoose.model('User', UserSchema);
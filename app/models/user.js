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
    },
    facebook: {
        id: String,
        token: String
    },
    twitter: {
        id: String,
        token: String
    },
    google: {
        id: String,
        token: String
    },

    created: {type: Date, default: Date.now}

});

UserSchema.set('toJSON', {getters: true, virtuals: true});

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
        var salt = 'key-' + Math.random() + ' ' + Math.random() + new Date();
        this.local.passwordSalt = hash(salt);
        this.local.passwordHashed = hash(this.local.passwordSalt + password);

    }

};


UserSchema.virtual('local.password').set(function (password) {
    this.setPassword(password);
});

UserSchema.virtual('name').get(function () {
    var name = '';

    if (this.first || this.last) {
        name += this.first ? this.first : '';
        name += this.last ? ' ' + this.last : '';
    } else {
        name = this.local.username;
    }

    return name;
});

module.exports = mongoose.model('User', UserSchema);
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({

    local: {
        username: String,
        password: String
    }

});

userSchema.methods = {

    validPassword: function (password) {
        return this.local.password === password
    }

};

module.exports = mongoose.model('User', userSchema);
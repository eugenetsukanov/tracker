var UserService = function (User) {
    var self = this;
    var _ = require('lodash');
    var async = require('async');

    this.getUserId = function (user) {
        return user._id || user || "";
    }
};

module.exports = UserService;
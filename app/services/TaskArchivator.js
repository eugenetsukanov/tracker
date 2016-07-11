module.exports = function () {
  var Task = require('../models/task');
  var moment = require('moment');

  this.archive = function (next) {
    var query = {
      status: 'accepted',
      updatedAt: {"$lte": moment().subtract(30, 'days')},
      archived: {$ne: true}
    };
    var update = {$set: {archived: true}};
    var options = {multi: true};

    Task.update(query, update, options, next);
  }
};
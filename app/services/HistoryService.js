var HistoryService = function (historyWriters) {
    var async = require('async');

    this.createTaskHistory = function (task, next) {
        async.each(historyWriters, function (Writer, callback) {
            new Writer(task).write(callback);
        }, next);
    };
};
module.exports = HistoryService;
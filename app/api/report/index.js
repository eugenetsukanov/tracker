module.exports = function (app) {

    var Task = require('../../models/task');
    var moment = require('moment');
    var async = require('async');
    var _ = require('lodash');

    var getStartDate = function (date) {
        return moment(date).startOf('day').toDate()
    };

    var getEndDate = function (date) {
        return moment(date).startOf('day').add(1, 'd').toDate();
    };

    app.get('/api/report/date/:date', function (req, res) {

        var date = Date.parse(req.params.date);
        Task.find({updatedAt: {$gt: getStartDate(date), $lt: getEndDate(date)}}).sort('-updatedAt').exec(function (err, tasks) {
            res.json(tasks);
        })
    });

    app.get('/api/report/task/:taskId', function (req, res) {

        var date = new Date();

        var getAtDate = {
            updatedAt: {$gt: getStartDate(date), $lt: getEndDate(date)}
        };

        var query = {
            _id: req.params.taskId
        };

        var updatedTasks = [];

        Task.findOne(_.extend(query, getAtDate), function (err, task) {
            if (err) return next(err);

            updatedTasks.push(task);

            var getChangedTasks = function (task, callback) {

                if (!task) return callback();

                task.getChildrenChanged(getAtDate, function (err, tasks) {
                    if (err) return next(err);

                    async.each(tasks, function (task, callback) {
                        updatedTasks.push(task);
                        getChangedTasks(task, callback);
                    }, function () {
                        callback(null);
                    })

                });

            };

            getChangedTasks(task, function () {
                res.json(updatedTasks);
            });

        });
    });

};
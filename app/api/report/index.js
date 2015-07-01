module.exports = function (app) {

    var Task = require('../../models/task');
    var moment = require('moment');
    var async = require('async');
    var _ = require('lodash');

    var getStartDate = function (date) {
        return moment(date).startOf('day').toDate()
    };

    var getEndDate = function (date) {
        return moment(date).endOf('day').toDate();
    };

    app.get('/api/tasks/report/:date', function (req, res) {

        var date = Date.parse(req.params.date);
        Task.find({
                updatedAt: {$gte: getStartDate(date), $lte: getEndDate(date)}
            })
            .sort('-updatedAt')
            .exec(function (err, tasks) {
                var tasksReport = [];
                async.each(tasks, function (task, next) {
                    task.hasAccess(req.user, function (err, access) {
                        if (access) {
                            tasksReport.push(task);
                            next();
                        } else {
                            next();
                        }
                    });
                }, function (err) {
                    if (err) return res.json([]);
                    res.json(tasksReport);
                });
            });
    });

    app.get('/api/tasks/:taskId/report/:date', function (req, res, next) {

        var date = Date.parse(req.params.date) || Date.now();
        var match = {
            updatedAt: {$gte: getStartDate(date), $lte: getEndDate(date)}
        };

        var query = {
            _id: req.params.taskId
        };

        var updatedTasks = [];

        Task.findOne(_.extend(query, match), function (err, task) {
            if (err) return next(err);

            if (!task) {
                return res.json(updatedTasks)
            } else {
                if (req.query.userId !== '') {
                    if (task.developer.toString() == req.query.userId.toString()) {
                        updatedTasks.push(task);
                    }
                } else {
                    updatedTasks.push(task);
                }
            }
            var getChangedTasks = function (task, callback) {

                task.getChildrenChanged(match, function (err, tasks) {
                    if (err) return next(err);

                    async.each(tasks, function (task, callback) {
                        if (req.query.userId !== '') {
                            if (task.developer.toString() == req.query.userId.toString()) {
                                updatedTasks.push(task);
                            }
                        } else {
                            updatedTasks.push(task);
                        }
                        getChangedTasks(task, callback);
                    }, function (err) {
                        if (err) return next(err);
                        callback();
                    })

                });

            };

            getChangedTasks(task, function () {
                res.json(updatedTasks);
            });

        });
    });
};
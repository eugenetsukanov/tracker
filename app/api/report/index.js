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

    app.get('/api/tasks/report/:date', function (req, res, next) {

        var date = Date.parse(req.params.date);
        Task.find({
                updatedAt: {$gt: getStartDate(date), $lt: getEndDate(date)},
                status: {$ne: ''}
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
            updatedAt: {$gt: getStartDate(date), $lt: getEndDate(date)},
            status: {$ne: ''}
        };

        var query = {
            _id: req.params.taskId
        };

        var updatedTasks = [];

        Task.findOne(_.extend(query, match), function (err, task) {
            if (err) return next(err);

            if (req.query.userId !== '') {
                match.developer = req.query.userId;
            }

            if (!task) {
                return res.json(updatedTasks)
            } else {
                updatedTasks.push(task);
            }
            var getChangedTasks = function (task, callback) {

                task.getChildrenChanged(match, function (err, tasks) {
                    if (err) return next(err);

                    async.each(tasks, function (task, callback) {
                        updatedTasks.push(task);
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
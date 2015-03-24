module.exports = function (app) {

    var form = require("express-form"),
        field = form.field;

    var TaskForm = form(
        field("title").trim().required()
    );

    var Task = require('../../models/task');

    var _ = require('lodash');

    app.get('/api/tasks', function (req, res) {
        Task.find({parentTaskId: null}, function (err, tasks) {
            res.json(tasks);
        })
    });

    app.get('/api/tasks/:taskId', function (req, res) {
        res.json(req.Task);
    });

    app.get('/api/tasks/:taskId/childTask', function (req, res) {

        Task.find({parentTaskId: req.Task._id}, function (err, tasks) {
            if (err) return next(err);

            if (!tasks) {
                res.json({});
            }
            else {
                res.json(tasks);
            }

        })
    });

    app.post('/api/tasks', TaskForm, function (req, res) {


        if (req.form.isValid) {
            var task = new Task(req.form);
            task.save(function (err, task) {
                res.json(task);
            });
        }
        else {
            res.sendStatus(400);
        }

    });

    app.post('/api/tasks/:taskId/childTask', TaskForm, function (req, res) {


        if (req.form.isValid) {
            var task = new Task(req.form);

            task.parentTaskId = req.Task._id;

            task.save(function (err, task) {
                res.json(task);
            });
        }
        else {
            res.sendStatus(400);
        }

    });

    app.delete('/api/tasks/:taskId/childTask', function (req, res) {

        req.Task.remove(function () {
            res.sendStatus(200);
        });

    });

    app.put('/api/tasks/:taskId/childTask', TaskForm, function (req, res) {

        var task = req.Task;

        if (req.form.isValid) {
            task.title = req.form.title;

            task.save(function (err, task) {
                res.json(task);
            });
        }
        else {
            res.sendStatus(400);
        }

    });

    app.param('taskId', function (req, res, next, taskId) {

        Task.findById(taskId, function (err, task) {
            req.Task = task;
            next();
        });
    });

    app.delete('/api/tasks/:taskId', function (req, res, next) {

        req.Task.remove(function () {
            Task.find({parentTaskId: req.Task._id}, function (err, tasks) {
                if (err) return next(err);

                if(tasks) {
                    _.map(tasks, function (task) {
                        task.remove()
                    })
                }
            });

            res.sendStatus(200);
        });

    });

    app.put('/api/tasks/:taskId', TaskForm, function (req, res) {

        var task = req.Task;

        if (req.form.isValid) {
            task.title = req.form.title;

            task.save(function (err, task) {
                res.json(task);
            });
        }
        else {
            res.sendStatus(400);
        }

    });

}
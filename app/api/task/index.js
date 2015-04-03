module.exports = function (app) {

    var form = require("express-form"),
        field = form.field;

    var TaskForm = form(
        field("title").trim().required(),
        field("spenttime").trim().isNumeric(),
        field("status").trim(),
        field("priority").trim().isInt(),
        field("complexity").trim().isInt()
    );

    var Task = require('../../models/task');

    var _ = require('lodash');

    app.get('/api/tasks', function (req, res) {
        Task.find({parentTaskId: null}).sort('-priority date').exec(function (err, tasks) {
            res.json(tasks);
        })
    });

    app.get('/api/tasks/:taskId', function (req, res) {
        res.json(req.Task);
    });

    //________________________________________________________

    app.get('/api/tasks/:taskId/move', function (req, res) {
        var tasks = [];
        req.Task.getParent(function (err, parent) {
            if (err) {
                res.sendStatus(500)
            }
            else if (!parent) {
                res.json(tasks)
            }
            else {
                parent.getParent(function (err, grandParent) {
                    if (err) {
                        res.sendStatus(500)
                    }
                    else if (!grandParent) {
                        res.json(tasks)
                    }
                    else {
                        tasks.push(grandParent);
                        grandParent.getChildren(function (err, children) {
                            if (err) {
                                res.sendStatus(500)
                            }
                            else {
                                tasks = tasks.concat(children);
                                res.json(tasks)
                            }
                        })

                    }
                })
            }
        })

    });


    //________________________________________________________

    app.get('/api/tasks/:taskId/tasks', function (req, res) {

        Task.find({parentTaskId: req.Task._id}).sort('-priority date').exec(function (err, tasks) {
            if (err) return next(err);

            if (!tasks) {
                res.json({});
            }
            else {
                res.json(tasks);
            }

        })
    });

    app.post('/api/tasks', TaskForm, function (req, res, next) {


        if (req.form.isValid) {
            var task = new Task(req.form);
            task.save(function (err) {
                if (err) return next(err);
                task.updateParent(function (err) {
                    if (err) return next(err);
                    res.json(task);
                });
            });
        }
        else {
            res.status(400).json(req.form.errors);
        }

    });

    app.post('/api/tasks/:taskId/tasks', TaskForm, function (req, res, next) {


        if (req.form.isValid) {
            var task = new Task(req.form);

            task.parentTaskId = req.Task._id;

            task.save(function (err, task) {
                if (err) return next(err);
                task.updateParent(function (err) {
                    if (err) return next(err);
                    res.json(task);
                });
            });
        }
        else {
            res.sendStatus(400);
        }

    });

    app.param('taskId', function (req, res, next, taskId) {

        Task.findById(taskId, function (err, task) {
            if (!task) {
                res.sendStatus(404)
            }
            else {
                req.Task = task;
                next();
            }

        });
    });

    app.delete('/api/tasks/:taskId', function (req, res, next) {
        req.Task.remove(function (err) {
            if (err) return next(err);
            req.Task.updateParent(function (err) {
                if (err) return next(err);
                res.sendStatus(200);
            });
        });
    });

    app.put('/api/tasks/:taskId', TaskForm, function (req, res) {

        var task = req.Task;

        if (req.form.isValid) {
            task.title = req.form.title;
            task.spenttime = req.form.spenttime;
            task.status = req.form.status;
            task.priority = req.form.priority;
            task.complexity = req.form.complexity;
            task.parentTaskId = req.body.parentTaskId;

            task.save(function (err, task) {
                if (err) return next(err);
                task.updateParent(function (err) {
                    if (err) return next(err);
                    res.json(task);
                });
            });
        }
        else {
            res.sendStatus(400);
        }

    });

};
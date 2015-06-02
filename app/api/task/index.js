module.exports = function (app) {

    var form = require("express-form"),
        field = form.field;

    var async = require('async');

    var TaskForm = form(
        field("title").trim().required(),
        field("description").trim(),
        field("spenttime").trim().isNumeric(),
        field("status").trim(),
        field("priority").trim().isInt(),
        field("complexity").trim().isInt(),
        field("developer"),
        field("team").array(),
        field("files").array(),
        field("tags").array()

    );

    var Task = require('../../models/task');
    var User = require('../../models/user');

    var _ = require('lodash');

    app.get('/api/tasks', function (req, res) {

        var q = {
            parentTaskId: null,
            $or: [
                {owner: req.user},
                {team: req.user}
            ]
        };

        Task
            .find(q)
            .populate('owner', '-local.passwordHashed -local.passwordSalt')
            .populate('developer', '-local.passwordHashed -local.passwordSalt')
            .sort('-priority date')
            .exec(function (err, tasks) {
                if (err) return console.log(err);
                res.json(tasks);
            });

    });

    app.get('/api/tasks/:taskId', function (req, res) {
        res.json(req.Task);
    });
    //________________________________________________________


    app.get('/api/tasks/:taskId/move', function (req, res, next) {


        var tasks = [];
        // grand parent
        // children of grand parent
        // current task children

        req.Task.getGrandParent(function (err, grandParent) {
            if (err) return next(err);

            if (grandParent) {
                tasks.push(grandParent);

                grandParent.getChildren(function (err, children) {
                    if (err) return next(err);
                    tasks = tasks.concat(children);

                    req.Task.getSiblings(function (err, siblings) {
                        if (err) return next(err);
                        tasks = tasks.concat(siblings);
                        res.json(tasks);
                    });
                })
            }
            else {
                req.Task.getSiblings(function (err, siblings) {
                    if (err) return next(err);
                    async.each(siblings, function (neighbor, next) {
                            neighbor.hasAccess(req.user, function (err, access) {
                                if (err) return next(err);
                                if (access) {
                                    tasks.push(neighbor);
                                    next();
                                }
                                else {
                                    next();
                                }
                            });
                        },
                        function (err) {
                            if (err) return next(err);
                            res.json(tasks);
                        });
                });
            }
        });

    });

    app.get('/api/tasks/:taskId/team', function (req, res, next) {
        req.Task.getRoot(function (err, root) {
            var team = root.team;
            team.push(root.owner);
            User.find({_id: {$in: team}}, '-local.passwordHashed -local.passwordSalt')
                .exec(function (err, users) {
                    if (err) return next(err);
                    res.json(users);
                });
        });
    });

    //________________________________________________________

    app.get('/api/tasks/:taskId/tasks', function (req, res) {

        Task.find({parentTaskId: req.Task._id})
            .sort('-priority date')
            .populate('owner', '-local.passwordHashed -local.passwordSalt')
            .populate('developer', '-local.passwordHashed -local.passwordSalt')
            .exec(function (err, tasks) {

                if (err) return next(err);

                if (!tasks) {
                    res.json({});
                }
                else {
                    res.json(tasks);
                }

            })
    });

    app.get('/api/tasks/:taskId/tagsList', function (req, res, next) {
        req.Task.getRoot(function (err, root) {
            if (err) return next(err);

            res.json(root.tagsList);

        });
    });
    //________________________________________________________


    app.post('/api/tasks', TaskForm, function (req, res, next) {


        if (req.form.isValid) {

            req.form.developer = req.form.developer || req.user._id;

            var task = new Task(req.form);
            task.owner = req.user._id;
            task.tagsList.concat(req.form.tags);
            console.log(req.form.tags);

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

            req.form.developer = req.form.developer || req.user._id;


            var task = new Task(req.form);

            task.parentTaskId = req.Task._id;
            task.owner = req.user._id;

            req.Task.getRoot(function (err, root) {
                console.log(root);
                //if (err) return next(err);
                //root.tagsList.concat(task.tags);
                //root.save(function (err, root) {
                //    if (err) return next(err);
                //    next();
                //})
            });


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

        Task
            .findById(taskId)
            .populate('owner', '-local.passwordHashed -local.passwordSalt')
            .populate('developer', '-local.passwordHashed -local.passwordSalt')
            .exec(function (err, task) {

                if (err) return next(err);

                if (!task) {
                    res.sendStatus(404);
                }
                else {
                    task.hasAccess(req.user, function (err, access) {
                        if (access) {
                            req.Task = task;
                            next();
                        } else {
                            res.sendStatus(403);
                        }
                    });
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

    app.put('/api/tasks/:taskId', TaskForm, function (req, res, next) {

        var task = req.Task;

        if (req.form.isValid) {
            task.title = req.form.title;
            task.spenttime = req.form.spenttime;
            task.status = req.form.status;
            task.priority = req.form.priority;
            task.complexity = req.form.complexity;
            task.parentTaskId = req.body.parentTaskId || null;
            task.team = req.form.team || [req.user];
            task.developer = req.form.developer || req.user;
            task.description = req.form.description;
            task.files = req.form.files;

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


    app.put('/api/tasks/:taskId/move/:parentTaskId', TaskForm, function (req, res) {

        var task = req.Task;
        req.Task.getParent(function (err, papa) {
            task.parentTaskId = req.params.parentTaskId;
            task.save(function (err, task) {
                if (err) return next(err);
                task.updateParent(function (err) {
                    if (err) return next(err);
                    res.json(task);
                    res.json(task);
                    if (papa) papa.save();
                });
            });
        });


        //res.sendStatus(400);

    });


    app.use(function (err, req, res, next) {
        if (err) {
            console.error(err);
            res.status(500).send(err.message);
        }
        else {
            next();
        }

    });

};
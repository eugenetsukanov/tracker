module.exports = function (app) {

    var GridFS = app.container.get('GridFS');

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
        field("tags").array(),
        field("tagsList").array(),
        field("archived").trim()
    );

    var Task = require('../../models/task');
    var User = require('../../models/user');

    var _ = require('lodash');
    var limit = 60;

    app.get('/api/tasks', function (req, res) {

        var page = parseInt(req.query.page) || 0;

        var q = {
            parentTaskId: null,
            $or: [
                {owner: req.user},
                {team: req.user}
            ],
            archived: {$ne: true}
        };

        Task
            .find(q)
            .populate('owner', '-local.passwordHashed -local.passwordSalt')
            .populate('developer', '-local.passwordHashed -local.passwordSalt')
            .sort('-priority date')
            //@@FIXME
            .skip(page*limit)
            .limit(limit)
            .exec(function (err, tasks) {
                if (err) return console.log(err);
                res.json(tasks);
            });

    });

    app.get('/api/tasks/archived', function (req, res) {

        Task.find({parentTaskId: null, archived: true})
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

    app.get('/api/tasks/:taskId', function (req, res) {
        res.json(req.Task);
    });

    //________________________________________________________

    app.get('/api/tasks/:taskId/move', function (req, res, next) {

        var excludeArchived = function (tasks) {
            return _.filter(tasks, function(task) {
                return task.archived == false;
            });
        };


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
                        tasks = excludeArchived(tasks);
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
                            tasks = excludeArchived(tasks);
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

        var page = parseInt(req.query.page) || 0;

        Task.find({parentTaskId: req.Task._id, archived: {$ne: true}})
            .sort('-priority date')
            .populate('owner', '-local.passwordHashed -local.passwordSalt')
            .populate('developer', '-local.passwordHashed -local.passwordSalt')
            //@@FIXME
            .skip(page*limit)
            .limit(limit)
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


    app.get('/api/tasks/:taskId/archive', function (req, res) {

        Task.find({parentTaskId: req.Task._id, archived: true})
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

    //________________________________________________________


    app.post('/api/tasks', TaskForm, function (req, res, next) {


        if (req.form.isValid) {

            req.form.developer = req.form.developer || req.user._id;

            var task = new Task(req.form);
            task.owner = req.user._id;

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

    app.delete('/api/tasks/:taskId/files/:fileId', function (req, res, next) {
        Task.update({_id: req.Task._id}, {$pull: {'files': {_id: req.params.fileId}}}, function (err) {
            if (err) next(err);

            GridFS.removeFile({_id: req.params.fileId}, function (err) {
                if (err) next(err);
                res.sendStatus(200);
            });

        });
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
            // console.log(req.Task.updatedAt);
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
            task.tags = req.form.tags;
            task.archived = req.form.archived;

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
        req.Task.getParent(function (err, parent) {
            task.parentTaskId = req.params.parentTaskId;
            task.save(function (err, task) {

                if (err) return next(err);

                task.updateParent(function (err) {
                    if (err) return next(err);


                    if (parent) {

                        parent.updateEstimateTime(function (err) {
                            if (err) return next(err);
                            parent.save(function (err) {
                                if (err) return next(err);

                                parent.updateParentStatus(function (err) {
                                    if (err) return next(err);
                                    parent.save(new Function());
                                });
                            });
                        });

                    }
                    res.json(task);
                });


            });
        });

    });

    //_________________________go to current project

    app.get('/api/tasks/:taskId/root', function (req, res, next) {
        req.Task.getRoot(function (err, root) {
            if (err) return next(err);
            res.json(root);
        });
    });

    //________________________search

    app.get('/api/tasks/:taskId/search', function (req, res, next) {

        var query = req.query.query || '';
        query = query.toString().toLowerCase().trim();


        req.Task.getRoot(function (err, root) {
            if (err) return next(err);
            root.deepFind(function (task) {

                var tags = task.tags || [];
                tags = tags.join(' ');

                var textQuery = ('' + task.title + ' ' + task.description + tags).toLowerCase();
                var queryArr = query.split(' ');
                var result = 0;

                queryArr.forEach(function (q) {
                    if (textQuery.indexOf(q) >= 0) {
                        result += 1;
                    }
                });

                return (queryArr.length == result) ? true : false;

            }, function (err, tasks) {
                if (err) return next(err);
                res.json(tasks);
            });
        });

    });

    //___________________________________tags

    app.get('/api/tasks/:taskId/tags/tagsList', function (req, res, next) {
        //sorting
        req.Task.getRoot(function (err, root) {
            if (err) return next(err);
            res.json(root.tagsList);
        });
    });

    app.get('/api/tasks/:taskId/tags', function (req, res, next) {

        var q = req.query.query || [];

        req.Task.getRoot(function (err, root) {
            if (err) return next(err);

            root.deepFind(function (task) {

                var counter = 0;

                q.forEach(function (tag, i) {
                    counter += (task.tags.indexOf(tag) >= 0) ? 1 : 0;
                });

                return (counter == q.length) ? true : false;

            }, function (err, tasks) {
                if (err) return next(err);
                res.json(tasks);
            });
        });
    });

    //__________________________error log

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
module.exports = function (app) {
    var FormService = app.container.get('FormService');
    var FileService = app.container.get('FileService');
    var TaskService = app.container.get('TaskService');
    var Task = app.container.get('Task');
    var User = app.container.get('User');

    var async = require('async');
    var _ = require('lodash');

    var form = require("express-form"),
        field = form.field;

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

    app.get('/api/tasks', function (req, res, next) {
        var query = {
            parentTaskId: null,
            $or: [
                {owner: req.user},
                {team: req.user}
            ],
            archived: {$ne: true}
        };

        TaskService.getEstimatedTasksByQuery(query, function (err, tasks) {
            if (err) {
                return next(err);
            }

            res.json(tasks);
        });
    });

    app.get('/api/tasks/archived', function (req, res, next) {
        var query = {
            parentTaskId: null,
            archived: true
        };

        TaskService.getEstimatedTasksByQuery(query, function (err, tasks) {
            if (err) {
                return next(err);
            }

            res.json(tasks);
        });
    });

    app.param('taskId', function (req, res, next, taskId) {

        TaskService.getEstimatedTaskById(taskId, function (err, task) {
            if (err) return next(err);

            if (!task) {
                return res.sendStatus(404);
            }

            TaskService.hasAccess(task, req.user, function (err, access) {
                if (err) {
                    return next(err);
                }

                if (!access) {
                    return res.sendStatus(403);
                }

                req.Task = task;
                next();
            });
        });
    });

    app.get('/api/tasks/:taskId', function (req, res) {
        res.json(req.Task);
    });

    //________________________________________________________

    app.get('/api/tasks/:taskId/move', function (req, res, next) {
        var excludeArchived = function (tasks) {
            return _.filter(tasks, function (task) {
                return task.archived == false;
            });
        };

        var tasks = [];
        // grand parent
        // children of grand parent
        // current task children

        TaskService.getGrandParent(req.Task, function (err, grandParent) {
            if (err) {
                return next(err);
            }

            if (grandParent) {
                tasks.push(grandParent);

                TaskService.getChildren(grandParent, function (err, children) {
                    if (err) {
                        return next(err);
                    }

                    tasks = tasks.concat(children);

                    TaskService.getSiblings(req.Task, function (err, siblings) {
                        if (err) {
                            return next(err);
                        }

                        tasks = tasks.concat(siblings);
                        tasks = excludeArchived(tasks);

                        res.json(tasks);
                    });
                })
            }
            else {
                TaskService.getSiblings(req.Task, function (err, siblings) {
                    if (err) {
                        return next(err);
                    }

                    async.each(siblings, function (neighbor, next) {
                            TaskService.hasAccess(neighbor, req.user, function (err, access) {
                                if (err) {
                                    return next(err);
                                }

                                if (access) {
                                    tasks.push(neighbor);
                                    next();
                                } else {
                                    next();
                                }
                            });
                        },
                        function (err) {
                            if (err) {
                                return next(err);
                            }

                            tasks = excludeArchived(tasks);
                            res.json(tasks);
                        });
                });
            }
        });
    });

    app.get('/api/tasks/:taskId/team', function (req, res, next) {
        TaskService.getTeam(req.Task, function (err, users) {
            if (err) {
                return next(err);
            }
            res.json(users);
        });
    });

    //________________________________________________________

    app.get('/api/tasks/:taskId/tasks', function (req, res, next) {
        TaskService.getEstimatedChildren(req.Task, function (err, tasks) {
            if (err) {
                return next(err);
            }

            res.json(tasks);
        });
    });


    app.get('/api/tasks/:taskId/archive', function (req, res) {
        var query = {
            parentTaskId: req.Task._id,
            archived: true
        };

        TaskService.getTasksByQuery(query, function (err, tasks, next) {
            if (err) {
                return next(err);
            }

            res.json(tasks);
        });
    });

    //________________________________________________________

    app.post('/api/tasks', TaskForm, FormService.validate, function (req, res, next) {
        TaskService.createTask(req.user, req.form, function (err, task) {
            if (err) return next(err);
            res.json(task);
        });
    });

    app.post('/api/tasks/:taskId/tasks', TaskForm, FormService.validate, function (req, res, next) {
        var task = _.merge({}, req.form, {parentTaskId: req.params.taskId});

        TaskService.createTask(req.user, task, function (err, task) {
            if (err) return next(err);
            res.json(task);
        });
    });

    app.delete('/api/tasks/:taskId/files/:fileId', function (req, res, next) {
        TaskService.removeFileById(req.Task, req.params.fileId, function (err) {
            if (err) {
                return next(err);
            }

            FileService.removeFile(req.params.fileId);

            res.sendStatus(200);
        });
    });

    app.delete('/api/tasks/:taskId', function (req, res, next) {
        TaskService.removeTask(req.user, req.Task, function (err) {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });

    app.put('/api/tasks/:taskId', TaskForm, FormService.validate, function (req, res, next) {
        var taskData = _.merge({parentTaskId: req.body.parentTaskId || null}, req.form);

        if (taskData.parentTaskId) {
            /// @@@ re-think and refactor
            TaskService.getTaskById(taskData.parentTaskId, function (err, parent) {
                TaskService.hasAccess(parent, req.user, function (err, access) {
                    if (err) return next(err);
                    if (!access) return res.sendStatus(403);

                    TaskService.updateTask(req.user, req.Task, taskData, function (err, task) {
                        if (err) return next(err);
                        res.json(task);
                    });
                });
            });
        } else {
            TaskService.updateTask(req.user, req.Task, taskData, function (err, task) {
                if (err) return next(err);
                res.json(task);
            });
        }
    });

    //@@@ update task info/fields on move
    //TaskForm, FormService.validate,
    app.put('/api/tasks/:taskId/move/:parentTaskId', function (req, res, next) {
        TaskService.moveTask(req.Task, req.params.parentTaskId, function (err, task) {
            if (err) return next(err);
            res.json(task);
        });
    });

    //_________________________go to current project

    app.get('/api/tasks/:taskId/root', function (req, res, next) {
        TaskService.getRoot(req.Task, function (err, root) {
            if (err) {
                return next(err);
            }

            res.json(root);
        });
    });

    //________________________search

    app.get('/api/tasks/:taskId/search', function (req, res, next) {
        var query = req.query.query || '';
        query = query.toString().toLowerCase().trim();

        TaskService.getRoot(req.Task, function (err, root) {
            if (err) {
                return next(err);
            }

            TaskService.deepFind(root, function (task) {
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

                return !!(queryArr.length === result);
            }, function (err, tasks) {
                if (err) {
                    return next(err);
                }

                res.json(tasks);
            });
        });
    });

    //___________________________________tags

    app.get('/api/tasks/:taskId/tags/tagsList', function (req, res, next) {
        //sorting
        TaskService.getRoot(req.Task, function (err, root) {
            if (err) {
                return next(err);
            }

            res.json(root.tagsList);
        });
    });

    app.get('/api/tasks/:taskId/tags', function (req, res, next) {
        var q = req.query.query || [];

        TaskService.getRoot(req.Task, function (err, root) {
            if (err) {
                return next(err);
            }

            TaskService.deepFind(root, function (task) {
                var counter = 0;

                q.forEach(function (tag, i) {
                    counter += (task.tags.indexOf(tag) >= 0) ? 1 : 0;
                });

                return !!(counter === q.length);
            }, function (err, tasks) {
                if (err) {
                    return next(err);
                }

                res.json(tasks);
            });
        });
    });

    app.post('/api/tasks/:taskId/metrics', TaskForm, FormService.validate, function (req, res, next) {
        var task = _.assign(req.Task, req.form);

        TaskService.calculateSimple(task, function (err, task) {
            if (err) {
                return next(err);
            }
            TaskService.findVelocity(task, function (err, velocity) {
                if (err) {
                    return next(err);
                }
                TaskService.estimateSimpleTask(velocity, task, function (err, task) {
                    if (err) {
                        return next(err);
                    }
                    res.json(task);
                });
            });
        })

    });
};


var TaskService = function (Task, FileService, UserService, SocketService) {
    var self = this;
    var _ = require('lodash');
    var async = require('async');
    var pointLine = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];


    this.calculate = function (task, next) {
        if (task.simple) {
            self.calculateSimple(task, next);
        } else {
            self.calculateComplex(task, next);
        }
    };

    this.calculateSimple = function (task, next) {
        if (task.complexity >= 0) {
            task.points = pointLine[task.complexity] || 0;
        } else {
            task.points = 0;
        }

        if (self.isAccepted(task) && task.points && task.spenttime) {
            task.velocity = task.points / task.spenttime;
        } else {
            task.velocity = 0;
        }

        next(null, task);
    };


    this.calculateComplex = function (task, next) {
        self.getChildren(task, function (err, children) {
            if (err) {
                return next(err);
            }

            self.calculateComplexByChildren(task, children, next);
        });
    };

    this.getVelocityByChildren = function (children, next) {
        var velocity = 0;
        var items = 0;

        _.forEach(children, function (child) {
            if (child.velocity) {
                velocity += child.velocity;
                items++;
            }
        });

        velocity = items ? velocity / items : 0;
        next(null, velocity);
    };

    this.findVelocity = function (task, next) {
        if (task.velocity) {
            next(null, task.velocity);
        } else {
            self.getParent(task, function (err, parent) {
                if (err) {
                    return next(err);
                }

                if (!parent) {
                    return next(null, 0);
                }

                self.findVelocity(parent, next);
            });
        }
    };

    this.estimateTask = function (velocity, task, next) {
        if (task.simple) {
            self.estimateSimpleTask(velocity, task, next);
        } else {
            self.estimateComplexTask(velocity, task, next);
        }
    };

    this.estimateSimpleTask = function (velocity, task, next) {
        if (velocity) {
            task.estimatedTime = task.points / velocity;
        }

        if (task.estimatedTime) {
            task.timeToDo = task.estimatedTime - task.spenttime;
        }

        task.timeToDo = task.timeToDo || 0;
        task.spenttime = task.spenttime || 0;

        next(null, task);
    };

    this.estimateComplexTask = function (velocity, task, next) {
        if (task.velocity) {
            task.estimatedTime = task.points / task.velocity;
            task.timeToDo = task.estimatedTime - task.spenttime;

            return next(null, task);
        } else {
            task.estimatedTime = velocity ? task.points / velocity : 0;
            task.timeToDo = task.estimatedTime - task.spenttime;

            return next(null, task);
        }
    };

    this.getEstimatedChildren = function (task, next) {
        self.findVelocity(task, function (err, velocity) {
            if (err) {
                return next(err);
            }

            var query = {
                parentTaskId: task,
                archived: {$ne: true}
            };

            self.getTasksByQuery(query, function (err, children) {
                if (err) {
                    return next(err);
                }

                async.map(children, function (child, next) {
                    self.estimateTask(velocity, child, next);
                }, next);
            });
        });
    };

    this.updateParentStatus = function (task, children, next) {
        if (task.simple) {
            return next(null, task);
        }

        var countAccepted = 0;
        var countNew = 0;

        children.forEach(function (task) {
            if (task.status === '') {
                countNew++;
            } else if (task.status == 'accepted') {
                countAccepted++;
            }
        });

        if (children.length === countAccepted) {
            task.status = 'accepted';
        } else if (children.length === countNew) {
            task.status = '';
        } else {
            // next one
            task.status = 'in progress';
        }

        next(null, task);
    };

    this.updateParent = function (parent, next) {
        next = next || _.noop;

        if (!parent) {
            return next();
        }

        self.calculateParent(parent, function (err, parent) {
            if (err) {
                return next(err);
            }

            var wasModified = parent.isModified();
            parent.save(function (err) {
                if (err) {
                    return next(err);
                }

                self.updateParentByTask(parent, function (err) {
                    if (err) return next(err);
                    wasModified && self.notifyUsers(parent, 'task.save');
                    next();
                });
            });
        });
    };

    this.getTeam = function (task, next) {
        self.getRoot(task, function (err, root) {
            if (err) {
                return next(err);
            }

            var team = root.team;
            team.push(root.owner);

            UserService.getUsers(team, next);
        });
    };

    this.notifyUsers = function (task, event, next) {
        next = next || _.noop;

        var taskId = self.getTaskId(task).toString();
        var parentId = self.getTaskId(task.parentTaskId).toString();

        this.getTeam(task, function (err, users) {
            if (err) return next(err);
            users.forEach(function (user) {
                SocketService.emitUser(UserService.getUserId(user), event, {task: taskId, parent: parentId});
            });
            next();
        });
    };


    this.updateParentByTask = function (task, next) {
        next = next || _.noop;

        if (!task.parentTaskId) {
            return next();
        }

        self.getParent(task, function (err, parent) {
            if (err) {
                return next(err);
            }

            if (!parent) {
                return next();
            }

            self.updateParent(parent, next);
        });
    };


    this.calculateComplexByChildren = function (task, children, next) {
        var totalSpentTime = 0;
        var totalPoints = 0;

        children.forEach(function (child) {
            totalSpentTime += child.spenttime;
            totalPoints += child.points;
        });

        task.spenttime = totalSpentTime;
        task.points = totalPoints;

        self.getVelocityByChildren(children, function (err, velocity) {
            if (err) {
                return next(err);
            }

            task.velocity = velocity;

            if (task.velocity) {
                task.estimatedTime = task.points / task.velocity;
                task.timeToDo = task.estimatedTime - task.spenttime;
            }

            next(null, task);
        });
    };

    this.calculateParent = function (parent, next) {
        self.getChildren(parent, function (err, children) {
            if (err) {
                return next(err);
            }

            parent.simple = children.length == 0;

            self.calculateComplexByChildren(parent, children, function (err, parent) {
                if (err) {
                    return next(err);
                }

                self.updateParentStatus(parent, children, function (err, parent) {
                    if (err) {
                        return next(err);
                    }

                    next(null, parent);
                });
            });
        });
    };


    this.deepFindByQuery = function (task, query, next) {
        self.getChildrenByQuery(task, query, function (err, children) {
            if (err) {
                return next(err);
            }

            var tasks = [];

            async.each(children, function (task, callback) {
                tasks.push(task);

                self.deepFindByQuery(task, query, function (err, aTasks) {
                    if (err) {
                        return next(err);
                    }

                    tasks = tasks.concat(aTasks);
                    callback();
                });
            }, function (err) {
                if (err) {
                    return next(err);
                }

                next(null, tasks);
            });

        })
    };

    this.deepFind = function (task, finder, next) {
        self.getChildren(task, function (err, children) {
            if (err) {
                return next(err);
            }

            var tasks = [];

            async.each(children, function (child, callback) {
                if (finder(child)) {
                    tasks.push(child);
                }

                self.deepFind(child, finder, function (err, aTasks) {
                    if (err) {
                        return next(err);
                    }

                    tasks = tasks.concat(aTasks);
                    callback();
                });
            }, function (err) {
                if (err) {
                    return next(err);
                }

                next(null, tasks);
            });
        })
    };


    this.removeFileById = function (task, fileId, next) {
        var query = {_id: task._id};
        var update = {$pull: {'files': {_id: fileId}}};

        Task.update(query, update, function (err) {
            if (err) {
                return next(err);
            }

            next();
        });
    };

    this.getChildrenByQuery = function (task, query, next) {
        query = _.extend({parentTaskId: task}, query);

        Task.find(query, function (err, tasks) {
            if (err) {
                return next(err);
            }

            next(null, tasks);
        });
    };

    this.updateRootTags = function (task, next) {
        next = next || _.noop;

        var glue = '|||';
        var originTags = task._origin && task._origin.tags || [];

        var areTagsAdded = task.tags.length || originTags.length;
        var tagsDifference = task.tags.join(glue) !== originTags.join(glue);
        var tagsModified = areTagsAdded && tagsDifference;

        if (!tagsModified) {
            return next();
        }

        self.getRoot(task, function (err, root) {
            if (err) {
                return next(err);
            }

            var tags = root.tagsList || [];

            root.tagsList = _.uniq(tags.concat(task.tags));

            var wasModified = root.isModified();
            root.save(function (err) {
                if (err) return next(err);
                wasModified && self.notifyUsers(root, 'task.save');
            });
        });
    };

    this.hasAccess = function (task, user, next) {
        self.getRoot(task, function (err, root) {
            if (err) {
                return next(err);
            }

            if (self.amIOwner(root, user) || self.isSharedToMe(root, user)) {
                next(null, true);
            } else {
                next(null, false);
            }
        });
    };

    this.isAccepted = function (task) {
        return task.isAccepted();
    };

    this.isSharedToMe = function (task, user) {
        return _.find(task.team || [], function (userId) {
            return user._id.toString() === userId.toString();
        });
    };

    this.amIOwner = function (root, user) {
        return root.owner._id.toString() === user._id.toString();
    };

    this.getEstimatedTask = function (task, next) {
        self.findVelocity(task, function (err, velocity) {
            if (err) {
                return next(err);
            }

            self.estimateTask(velocity, task, next);
        });
    };

    this.getEstimatedTasksByQuery = function (query, next) {
        self.getTasksByQuery(query, function (err, tasks) {
            if (err) return next(err);
            async.map(tasks, function (task, next) {
                self.getEstimatedTask(task, next);
            }, next);
        });
    };

    this.getEstimatedTaskById = function (task, next) {
        self.getTaskById(task, function (err, task) {
            if (err) return next(err);
            if (!task) return next();

            self.getEstimatedTask(task, next);
        });
    };

    this.createTask = function (user, task, next) {
        task.developer = task.developer || UserService.getUserId(user);
        task.owner = UserService.getUserId(user);
        task.parentTaskId = task.parentTaskId ? task.parentTaskId : undefined;

        task = new Task(task);

        self.calculate(task, function (err, task) {
            if (err) {
                return next(err);
            }

            task.save(function (err) {
                if (err) return next(err);

                FileService.connectFiles(task.files);
                self.updateRootTags(task);

                self.updateParentByTask(task, function (err) {
                    if (err) {
                        return next(err);
                    }

                    self.getEstimatedTask(task, function (err, task) {
                        if (err) return next(err);
                        self.notifyUsers(task, 'task.save');
                        next(null, task);
                    });
                });
            });
        });
    };

    this.updateTask = function (user, task, taskData, next) {
        taskData.developer = taskData.developer ? taskData.developer : undefined;

        _.assign(task, taskData);

        task.parentTaskId = taskData.parentTaskId || null;

        task.team = task.team || [user];

        task.developer = task.developer || user;

        self.calculate(task, function (err, task) {
            if (err) {
                return next(err);
            }

            var wasModified = task.isModified();
            task.save(function (err, task) {
                if (err) {
                    return next(err);
                }

                FileService.connectFiles(task);
                self.updateRootTags(task);

                self.updateParentByTask(task, function (err) {
                    if (err) {
                        return next(err);
                    }

                    self.getEstimatedTask(task, function (err, task) {
                        if (err) return next(err);
                        wasModified && self.notifyUsers(task, 'task.save');
                        next(null, task);
                    });
                });
            });
        });
    };


    this.removeTaskStuff = function (task, next) {
        next = next || _.noop;
        FileService.removeFiles(task.files, next);
    };

    this.removeChildren = function (task, next) {
        next = next || _.noop;

        self.getChildren(task, function (err, tasks) {
            if (err) return next(err);

            async.each(tasks, function (task, next) {
                self.removeTaskStuff(task);

                self.notifyUsers(task, 'task.remove');
                task.remove(function (err) {
                    if (err) return next(err);
                    self.removeChildren(task, next);
                });
            }, next);
        });
    };

    this.removeTask = function (user, task, next) {
        self.notifyUsers(task, 'task.remove', function (err) {
            if (err) return next(err);
            task.remove(function (err) {
                if (err) {
                    return next(err);
                }

                self.removeTaskStuff(task);

                self.removeChildren(task, function (err) {
                    if (err) {
                        return next(err);
                    }

                    self.updateParentByTask(task, function (err) {
                        if (err) return next(err);
                        next();
                    });
                });
            });
        });
    };

    this.moveTask = function (task, newParent, next) {
        self.getTaskById(task, function (err, task) {
            if (err) return next(err);
            if (!task) return next(new Error('No task'));

            self.getParent(task, function (err, parent) {
                if (err) {
                    return next(err);
                }

                self.getTaskById(newParent, function (err, newParent) {
                    if (err) {
                        return next(err);
                    }

                    if (!newParent) return next(new Error('No new parent'));

                    task.parentTaskId = newParent;

                    task.save(function (err, task) {
                        if (err) {
                            return next(err);
                        }

                        self.updateParent(parent, function (err) {
                            if (err) {
                                return next(err);
                            }

                            self.updateParent(newParent, function (err) {
                                if (err) {
                                    return next(err);
                                }

                                self.notifyUsers(task, 'task.save');

                                next(null, task);
                            });
                        });
                    });
                });
            });
        });

    };

    this.getSiblings = function (task, next) {
        var query = {
            parentTaskId: task.parentTaskId || null,
            _id: {$ne: task}
        };

        self.getTasksByQuery(query, function (err, tasks) {
            if (err) {
                return next(err);
            }

            next(null, tasks);
        });
    };

    this.getTasksByQuery = function (query, next) {
        Task.find(query)
            .sort('-priority date')
            .populate('owner', '-local.passwordHashed -local.passwordSalt')
            .populate('developer', '-local.passwordHashed -local.passwordSalt')
            .exec(function (err, tasks) {
                if (err) {
                    return next(err);
                }

                next(null, tasks);
            });
    };

    this.getRoot = function (task, next) {
        if (!task) return next(new Error('No task to get root'));

        if (task.parentTaskId) {
            self.getParent(task, function (err, parent) {
                if (err) {
                    return next(err);
                }

                self.getRoot(parent, next);
            });
        } else {
            self.getTaskById(task, function (err, root) {
                if (err) return next(err);
                if (!root) return next(new Error('No root'));
                next(null, root);
            });
        }
    };

    this.getTaskId = function (task) {
        if (!task) return '';
        return task._id ? task._id : task || '';
    };

    this.getTaskById = function (task, next) {
        Task.findById(this.getTaskId(task))
            .populate('owner', '-local.passwordHashed -local.passwordSalt')
            .populate('developer', '-local.passwordHashed -local.passwordSalt')
            .exec(next);
    };

    this.getGrandParent = function (task, next) {
        self.getParent(task, function (err, parent) {
            if (err) {
                return next(err);
            }

            if (!parent) {
                return next(null, null);
            }

            self.getParent(parent, next);
        });
    };


    this.getChildren = function (task, next) {
        var taskId = self.getTaskId(task);

        self.getTasksByQuery({parentTaskId: taskId}, function (err, tasks) {
            if (err) {
                return next(err);
            }

            next(null, tasks);
        });
    };

    this.getParent = function (task, next) {
        if (task.parentTaskId) {
            Task.findById(task.parentTaskId, next);
        } else {
            next();
        }
    };

};

module.exports = TaskService;
var TaskService = function (Task, FileService, UserService) {
    var self = this;
    var _ = require('lodash');
    var async = require('async');
    var pointLine = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

    this.countVelocityByChildren = function (children, next) {
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

    this.preCalculateEstimatedTime = function (task, toCalcEstimate, next) {
        if (toCalcEstimate && task.simple) {
            self.findVelocity(task, function (err, velocity) {
                if (err) {
                    return next(err);
                }

                task.estimatedTime = velocity ? task.points / velocity : 0;
                next(null, task);
            });
        } else {
            next(null, task);
        }
    };

    this.calculate = function (task, next) {
        if (task.simple) {
            self.calculateSimple(task, next);
        } else {
            self.calculateComplex(task, next);
        }
    };

    this.calculateComplex = function (task, next) {
        self.getChildren(task, function (err, children) {
            if (err) {
                return next(err);
            }

            self.calculateComplexByChildren(task, children, next);
        });
    };

    this.calculateSimpleEstimate = function (velocity, task, next) {
        if (!self.isAccepted(task) && velocity) {
            task.estimatedTime = task.points / velocity;
        }

        if (task.estimatedTime) {
            task.timeToDo = task.estimatedTime - task.spenttime;
        }

        task.timeToDo = task.timeToDo || 0;
        task.spenttime = task.spenttime || 0;

        next(null, task);
    };

    this.calculateComplexEstimate = function (velocity, task, next) {
        if (task.velocity) {
            task.estimatedTime = task.points / task.velocity;
            task.timeToDo = task.estimatedTime - task.spenttime;

            return next(null, task);
        } else {
            task.estimatedTime = task.points / velocity;
            task.timeToDo = task.estimatedTime - task.spenttime;

            return next(null, task);
        }
    };

    this.getEstimatedChildren = function (parent, next) {
        self.findVelocity(parent, function (err, velocity) {
            if (err) {
                return next(err);
            }

            var query = {
                parentTaskId: parent._id,
                archived: {$ne: true}
            };

            self.getTasksByQuery(query, function (err, children) {
                if (err) {
                    return next(err);
                }

                var result = [];

                children.forEach(function (child) {
                    if (child.simple) {
                        self.calculateSimpleEstimate(velocity, child, function (err, child) {
                            if (err) {
                                return next(err);
                            }

                            result.push(child);
                        });
                    } else {
                        self.calculateComplexEstimate(velocity, child, function (err, child) {
                            if (err) {
                                return next(err);
                            }

                            result.push(child);
                        });
                    }
                });

                next(null, result);
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
        if (task.parentTaskId) {
            self.getParent(task, function (err, parent) {
                if (err) {
                    return next(err);
                }

                self.getRoot(parent, next);
            });
        } else {
            self.getTaskById(task, next);
        }
    };

    this.getTaskId = function (task) {
        return task._id ? task._id : task;
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

    this.updateParentStatus = function (task, children, next) {
        task.simple = !children.length;

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

    this.getChildren = function (task, next) {
        var taskId = self.getTaskId(task);

        self.getTasksByQuery({parentTaskId: taskId}, function (err, tasks) {
            if (err) {
                return next(err);
            }

            next(null, tasks);
        });
    };

    this.calculateSimple = function (task, next) {
        if (task.complexity >= 0) {
            task.points = pointLine[task.complexity] || 0;
        } else {
            task.points = 0;
        }

        if (self.isAccepted(task) && task.points && task.spenttime) {
            task.velocity = task.points / task.spenttime;
        }

        next(null, task);
    };

    this.getParent = function (task, next) {
        if (task.parentTaskId) {
            Task.findById(task.parentTaskId, next);
        } else {
            next();
        }
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

            parent.save(function (err) {
                if (err) {
                    return next(err);
                }

                self.updateParentByTask(parent, next);
            });
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

        self.countVelocityByChildren(children, function (err, velocity) {
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

    this.removeChildren = function (task, next) {
        next = next || _.noop;

        self.getChildren(task, function (err, tasks) {
            if (err) return next(err);

            // @@@slava check update parent
            async.each(tasks, function (task, callback) {
                FileService.removeFiles(task.files);
                task.remove(callback);
            }, next);
        });
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

    this.getChildrenByQuery = function (task, query, next) {
        var query = _.extend({parentTaskId: task}, query);

        Task.find(query, function (err, tasks) {
            if (err) {
                return next(err);
            }

            next(null, tasks);
        })
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

            root.save(function (err) {
                if (err) {
                    return next(err);
                }

                next();
            });
        });
    };

    this.hasAccess = function (task, user, next) {
        self.getRoot(task, function (err, root) {
            if (err) {
                return next(err);
            }

            if (self.amIOwner(root, user) || self.isSharedToMe(root.team, user)) {
                next(null, true);
            } else {
                next(null, false);
            }
        });
    };

    this.isAccepted = function (task) {
        return task.isAccepted();
    };

    this.isSharedToMe = function (team, user) {
        return _.find(team, function (userId) {
            return user._id.toString() === userId.toString();
        });
    };

    this.amIOwner = function (root, user) {
        return root.owner._id.toString() === user._id.toString();
    };

    // @@@slava check for duplicates
    this.estimateTask = function (velocity, task) {
        if (task.isAccepted()) {
            task.estimatedTime = velocity ? task.points / velocity : 0;
        }

        if (task.estimatedTime) {
            task.timeToDo = task.estimatedTime - task.spenttime;
        } else {
            task.timeToDo = 0;
        }

        return task;
    };

    this.getEstimatedTask = function (task, next) {
        self.findVelocity(task, function (err, velocity) {
            if (err) {
                return next(err);
            }

            next(null, self.estimateTask(velocity, task));
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

                    // @@@slava notify parents
                    next(null, task);
                });
            });
        });
    }
};

module.exports = TaskService;
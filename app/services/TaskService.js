var TaskService = function (Task, FileService, UserService) {
    var self = this;
    var _ = require('lodash');
    var async = require('async');
    var pointLine = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

    this.getVelocity = function (task) {
        var result = 0;

        // @@@slava re-read _velocity logic
        if (task._velocity.length) {
            var velositySum = 0;

            _.forEach(task._velocity, function (velocity) {
                velositySum += velocity;
            });

            result = velositySum / task._velocity.length;
        }

        return result;
    };

    this.countParentVelocity = function (a, b, c) {
        if (arguments.length === 2) {
            var task = a;
            var next = b;

            self.getChildren(task, function (err, children) {
                if (err) {
                    return next(err);
                }

                countVelocity(children, next);
            });
        } else {
            var children = b;
            var next = c;

            countVelocity(children, next);
        }

        function countVelocity(children, next) {
            var result = [];

            _.forEach(children, function (child) {
                if (child.velocity) {
                    result.push(child.velocity);
                }
            });

            var velocity = result.length ? _.sum(result) / result.length : 0;

            next(null, velocity);
        }
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

    this.calculateComplex = function (a, b, c) {
        if (arguments.length === 2) {
            var task = a;
            var next = b;

            self.getChildren(task, function (err, children) {
                if (err) {
                    return next(err);
                }

                calc(task, children, next);
            });
        } else {
            var task = a;
            var children = b;
            var next = c;

            calc(task, children, next);
        }

        function calc(task, children, next) {
            var totalSpentTime = 0;
            var totalPoints = 0;

            children.forEach(function (child) {
                totalSpentTime += child.spenttime;
                totalPoints += child.points;
            });

            self.countParentVelocity(task, children, function (err, velocity) {
                if (err) {
                    return next(err);
                }

                task.velocity = velocity;
            });

            task.spenttime = totalSpentTime;
            task.points = totalPoints;
            //task._velocity = velocity;

            if (task.velocity) {
                task.estimatedTime = task.points / task.velocity;
                task.timeToDo = task.estimatedTime - task.spenttime;
            }

            next(null, task);
        }
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

            next(null, task);
        } else {
            task.estimatedTime = task.points / velocity;
            task.timeToDo = task.estimatedTime - task.spenttime;

            next(null, task);
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

    this.prepareTask = function (data) {
        var task = data.task;

        task.developer = data.task.developer || data.user._id;
        task.owner = data.user._id;
        task.parentTaskId = data.parentTaskId ? data.parentTaskId : undefined;

        return task;
    };

    this.createNewTask = function (taskData, next) {
        var task = new Task(taskData);

        self.calculate(task, function (err, task) {
            if (err) {
                return next(err);
            }

            task.save(function (err, _task) {
                if (err) {
                    return next(err);
                }

                next(null, _task);
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

    this.updateParentStatus = function (a, b, c) {
        if (arguments.length === 2) {
            var task = a;
            var next = b;

            self.getChildren(task, function (err, children) {
                if (err) {
                    return next(err);
                }

                updateParentStatus(task, children, next);
            });
        } else {
            var task = a;
            var children = b;
            var next = c;

            updateParentStatus(task, children, next);
        }

        function updateParentStatus(task, tasks, next) {
            if (!tasks.length) {
                task.status = '';
                task.simple = true;

                return next(null, task);
            }

            var countInProgress = 0;
            var countAccepted = 0;
            var countNew = 0;

            tasks.forEach(function (task) {
                if (task.status == 'in progress') {
                    countInProgress += 1;
                } else if (task.status == 'accepted') {
                    countAccepted += 1;
                } else {
                    countNew += 1;
                }
            });

            if ((countInProgress > 0 || (countAccepted > 0 && countAccepted < tasks.length))) {
                task.status = 'in progress';
            } else if (countAccepted == tasks.length) {
                task.status = 'accepted';
            } else {
                task.status = '';
            }

            task.simple = false;

            next(null, task);
        }
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

        self.calculateParent(parent, function (err, updatedParent) {
            if (err) {
                return next(err);
            }

            updatedParent.save(function (err) {
                if (err) {
                    return next(err);
                }

                self.updateParentByTask(updatedParent, next);
            });
        });
    };

    this.calculateParent = function (parent, next) {
        self.getChildren(parent, function (err, children) {
            if (err) {
                return next(err);
            }

            self.calculateComplex(parent, children, function (err, updatedParent) {
                if (err) {
                    return next(err);
                }

                self.updateParentStatus(updatedParent, children, function (err, _updatedParent) {
                    if (err) {
                        return next(err);
                    }

                    next(null, _updatedParent);
                });
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

            self.calculateParent(parent, function (err, updatedParent) {
                if (err) {
                    return next(err);
                }

                updatedParent.save(function (err) {
                    if (err) {
                        return next(err);
                    }

                    self.updateParentByTask(updatedParent, next);
                });
            });
        });
    };

    this.removeChildren = function (task, next) {
        next = next || _.noop;

        self.getChildren(task, function (err, tasks) {
            if (err) return next(err);

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
        var userId = user._id || user;
        return _.find(team, function (userId) {
            return userId.toString() === userId.toString();
        });
    };

    this.amIOwner = function (root, user) {
        return root.owner._id.toString() === user._id.toString();
    };

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

                // @@@slava check this method
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
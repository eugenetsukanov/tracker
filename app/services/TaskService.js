var TaskService = function () {
        var self = this;
        var _ = require('lodash');

        var Task = require('../models/task');

        this.updateEstimateTime = function (task, next) {
            //@@@ we don't have simple parent, they're always complex
            if (task.simple) {
                return self.calculateSimple(task, next);
            }

            self.getChildren(task, function (err, tasks) {
                if (err) {
                    return next(err);
                }

                var estimatedTime = 0;

                tasks.forEach(function (task) {
                    console.log('>>>>>', task.estimatedTime)
                    //@@@ estimated time doesn't save and we always have 0
                    estimatedTime += task.estimatedTime;
                });

                task.estimatedTime = estimatedTime;

                if (!task.estimatedTime) {
                    task.timeToDo = 0;
                } else {
                    task.timeToDo = task.estimatedTime - task.spenttime;
                }

                next(null, task);
            });
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

        this.getChildrenByParent = function (parent, next) {
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
                            result.push(child);
                        }
                    });

                    next(null, result);
                });
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

        this.getTaskById = function (task, next) {
            var taskId = task._id ? task._id : task;

            Task.findById(taskId)
                .sort('-updatedAt')
                .populate('owner', '-local.passwordHashed -local.passwordSalt')
                .populate('developer', '-local.passwordHashed -local.passwordSalt')
                .exec(next);
        };

        this.calculateSimpleEstimate = function (velocity, task, next) {
            if (velocity) {
                task.estimatedTime = task.points / velocity;
            }

            if (task.estimatedTime) {
                task.timeToDo = task.estimatedTime - task.spenttime;
            }

            task.estimatedTime = task.estimatedTime || 0;
            task.timeToDo = task.timeToDo || 0;
            task.spenttime = task.spenttime || 0;

            next(null, task);
        };

        this.preCalculateEstimatedTime = function (task, next) {
            if (!task.points || !task.parentTaskId) {
                return next();
            }

            self.getParent(task, function (err, parent) {
                if (err) {
                    return next(err);
                }

                if (!parent) {
                    return next();
                }

                self.findVelocity(parent, function (err, velocity) {
                    if (err) {
                        return next(err);
                    }

                    task.estimatedTime = task.estimatedTime || 0;
                    task.timeToDo = task.timeToDo || 0;
                    task.spenttime = task.spenttime || 0;

                    if (velocity) {
                        task.estimatedTime = task.points / velocity;
                    }

                    task.timeToDo = task.estimatedTime - task.spenttime;

                    next();
                });
            });
        };

        this.updateParentStatus = function (task, next) {
            self.getChildren(task, function (err, tasks) {
                if (err) {
                    return next(err);
                }

                if (!tasks.length) {
                    return next();
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

                next(null, task);
            });
        };

        this.getChildren = function (task, next) {
            var taskId = task._id ? task._id : task;

            Task.find({parentTaskId: taskId})
                .sort('-updatedAt')
                .populate('owner', '-local.passwordHashed -local.passwordSalt')
                .populate('developer', '-local.passwordHashed -local.passwordSalt')
                .exec(function (err, tasks) {
                    if (err) {
                        return next(err);
                    }

                    next(null, tasks);
                })
        };

        this.calculateSimple = function (task, next) {
            if (task.complexity >= 0) {
                var row = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
                task.points = row[task.complexity];
            } else {
                task.points = 0;
            }

            if (task.points && task.spenttime && task.isAccepted()) {
                task.velocity = task.points / task.spenttime;
            }

            next(null, task);
        };

        this.getParent = function (task, next) {
            var parentTaskId = task.parentTaskId;

            if (parentTaskId) {
                Task.findById(parentTaskId, function (err, task) {
                    if (err) {
                        return next(err);
                    }

                    next(null, task);
                });
            } else {
                next();
            }
        };

        this.updateParent = function (task, next) {
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
                self.updateEstimateTime(parent, function (err, updatedParent) {
                    if (err) {
                        return next(err);
                    }

                    self.updateParentStatus(updatedParent, function (err, _updatedParent) {
                        if (err) {
                            return next(err);
                        }

                        _updatedParent.save(function (err) {
                            if (err) {
                                return next(err);
                            }

                            self.updateParent(_updatedParent, next);
                        });
                    });
                });

            });
        };
    }
    ;

module.exports = TaskService;
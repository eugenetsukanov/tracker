var TaskService = function (Task) {
    var self = this;
    var _ = require('lodash');

    this.updateEstimateTime = function (task, next) {
        if (task.simple) {
            return self.calculateSimple(task, next);
        }

        self.getChildren(task, function (err, tasks) {
            if (err) {
                return next(err);
            }

            var estimatedTime = 0;

            tasks.forEach(function (task) {
                estimatedTime += task.estimatedTime;
            });

            task.estimatedTime = estimatedTime;
            task.timeToDo = task.estimatedTime - task.spenttime;

            next();
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

            next()
        });
    };

    this.getChildren = function (task, next) {
        Task.find({parentTaskId: task._id})
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

        next();
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

            if (parent) {
                self.updateEstimateTime(parent, function (err) {
                    if (err) {
                        return next(err);
                    }

                    self.updateParentStatus(parent, function (err) {
                        if (err) {
                            return next(err);
                        }

                        parent.save(function (err) {
                            if (err) {
                                return next(err);
                            }

                            self.updateParent(parent, next);
                        });
                    });
                });
            }
        });
    };
};

module.exports = TaskService;
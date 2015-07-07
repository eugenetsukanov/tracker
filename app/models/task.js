var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');
var async = require('async');

var application = require('../config/application');
var GridFS = application.get('GridFS');

var FileSchema = require('./file.schema');

var TaskSchema = new Schema({
    title: String,
    description: String,
    user: String,
    priority: {type: Number, default: 5, index: true},
    status: String,
    spenttime: {type: Number, default: 0},
    complexity: {type: Number, default: 0},
    points: {type: Number, default: 0},
    velocity: {type: Number, default: 0},
    parentTaskId: {type: Schema.Types.ObjectId, ref: "Task", default: null},
    date: {type: Date, default: Date.now, index: true},
    updatedAt: {type: Date, default: null, index: true},
    simple: {type: Boolean, default: true},
    estimatedTime: {type: Number, default: 0},
    timeToDo: {type: Number, default: 0},
    owner: {type: Schema.Types.ObjectId, ref: "User"},
    developer: {type: Schema.Types.ObjectId, ref: "User", default: null},
    team: [{type: Schema.Types.ObjectId, ref: "User", default: []}],
    files: [FileSchema],
    tags: [String],
    tagsList: [String],
    archived: {type: Boolean, default: false}
});

TaskSchema.set('toJSON', {getters: true, virtuals: true});

TaskSchema.pre('init', function (next, task) {
    this._origin = _.merge({}, task);
    this.preCalculateEstimatedTime(task, next);
});

TaskSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    this.calculate(next);
});

TaskSchema.methods = {

    checkSimple: function (next) {
        this.countChildren(function (err, cnt) {
            if (err) return next(err);
            next(null, cnt == 0)
        });
    },

    findVelocity: function (next) {
        if (this.velocity) {
            next(null, this.velocity);
        } else {
            this.getParent(function (err, task) {
                if (err) return next(err);
                if (!task) return next(null, 0);
                task.findVelocity(next);
            });
        }
    },

    updateEstimateTime: function (next) {

        if (this.simple) {
            return this.calculateSimple(next);
        }

        this.getChildren(function (err, tasks) {
            if (err) return next(err);

            var estimatedTime = 0;

            tasks.forEach(function (task) {
                estimatedTime += task.estimatedTime;
            });

            this.estimatedTime = estimatedTime;
            this.timeToDo = this.estimatedTime - this.spenttime;

            next();
        }.bind(this));
    },
    updateParent: function (next) {
        next = next || new Function;
        if (!this.parentTaskId) return next();

        this.getParent(function (err, parent) {
            if (err) return next(err);
            if (!parent) return next();

            if (parent) {
                parent.save(function (err) {
                    if (err) return next(err);

                    parent.updateEstimateTime(function (err) {
                        if (err) return next(err);
                        parent.save(function (err) {
                            if (err) return next(err);

                            parent.updateParentStatus(function (err) {
                                if (err) return next(err);
                                parent.save(next);
                            });
                        });
                    });

                });

            }

        }.bind(this));

    },

    updateParentStatus: function (next) {

        this.getChildren(function (err, tasks) {
            if (err) return next(err);
            if (!tasks.length) return next();

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
                this.status = 'in progress';
            } else if (countAccepted == tasks.length) {
                this.status = 'accepted';
            } else {
                this.status = '';
            }

            next()
        }.bind(this));
    },

    calculate: function (next) {

        this.checkSimple(function (err, simple) {
            this.simple = simple;

            if (!this.simple) {

                this.calculateComplex(next);

            } else {

                this.calculateSimple(next);

            }

        }.bind(this));


    },

    calculateComplex: function (next) {

        this.getChildren(function (err, tasks) {
            if (err) return next(err);

            var velocity = 0;

            var totalSpentTime = 0;
            var totalPoints = 0;

            var acceptedSpentTime = 0;
            var acceptedPoints = 0;


            tasks.forEach(function (task) {

                totalSpentTime += task.spenttime;
                totalPoints += task.points;

                if (task.isAccepted()) {
                    acceptedSpentTime += task.spenttime;
                    acceptedPoints += task.points;
                }

            });

            if (acceptedSpentTime && acceptedPoints) {
                velocity = acceptedPoints / acceptedSpentTime;
            }

            this.spenttime = totalSpentTime;
            this.points = totalPoints;
            this.velocity = velocity;


            next();

        }.bind(this));

    },

    calculateSimple: function (next) {
        if (this.complexity >= 0) {
            var row = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
            var points = row[this.complexity];
            this.points = points;
        } else {
            this.points = 0;
        }

        if (this.points && this.spenttime && this.isAccepted()) {
            this.velocity = this.points / this.spenttime;
        }

        next();
    },

    preCalculateEstimatedTime: function (task, next) {

        if (task.points && task.parentTaskId) {

            Task.findById(task.parentTaskId, function (err, parent) {

                if (err) return next(err);
                if (!parent) return next();

                parent.findVelocity(function (err, velocity) {
                    if (err) return next(err);

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
        } else {
            next();
        }
    },

    removeChildren: function () {
        this.getChildren(function (err, tasks) {
            tasks.forEach(function (task) {
                task.remove(new Function);
            })
        });
    },

    getChildren: function (next) {
        Task.find({parentTaskId: this})
            .sort('-updatedAt')
            .populate('owner', '-local.passwordHashed -local.passwordSalt')
            .populate('developer', '-local.passwordHashed -local.passwordSalt')
            .exec(function (err, tasks) {
                if (err) return next(err);
                next(null, tasks);
            })
    },

    deepFind: function (finder, next) {
        this.getChildren(function (err, children) {
            if (err) return next(err);
            var tasks = [];

            async.each(children, function (task, callback) {

                if (finder(task)) {
                    tasks.push(task);
                }

                task.deepFind(finder, function (err, aTasks) {
                    if (err) return next(err);
                    tasks = tasks.concat(aTasks);
                    callback();
                });

            }, function (err) {
                if (err) return next(err);
                next(null, tasks);
            });

        })
    },
    deepFindByQuery: function (query, next) {
        this.getChildrenByQuery(query, function (err, children) {
            if (err) return next(err);
            var tasks = [];

            async.each(children, function (task, callback) {

                tasks.push(task);

                task.deepFindByQuery(query, function (err, aTasks) {
                    if (err) return next(err);
                    tasks = tasks.concat(aTasks);
                    callback();
                });

            }, function (err) {
                if (err) return next(err);
                next(null, tasks);
            });

        })
    },

    getChildrenByQuery: function (query, next) {
        var query = _.extend({parentTaskId: this}, query);

        Task.find(query, function (err, tasks) {
            if (err) return next(err);

            next(null, tasks);
        })
    },

    getSiblings: function (next) {
        Task.find({parentTaskId: this.parentTaskId || null, _id: {$ne: this}}, function (err, tasks) {
            if (err) return next(err);

            next(null, tasks);
        });
    },

    getParent: function (next) {
        if (this.parentTaskId) {
            Task.findById(this.parentTaskId, function (err, task) {
                if (err) return next(err);

                next(null, task);
            });
        } else {
            next(null, null);
        }
    },
    getRoot: function (next) {
        if (this.parentTaskId) {
            this.getParent(function (err, parent) {
                if (err) return next(err);
                parent.getRoot(next);
            });
        } else {
            Task.findById(this._id)
                .sort('-updatedAt')
                .populate('owner', '-local.passwordHashed -local.passwordSalt')
                .populate('developer', '-local.passwordHashed -local.passwordSalt')
                .exec(next);
        }
    },
    getGrandParent: function (next) {
        this.getParent(function (err, parent) {
            if (err) return next(err);
            if (!parent) return next(null, null);
            parent.getParent(next);
        });
    },
    isAccepted: function () {
        return this.status == 'accepted';
    },
    hasAccess: function (user, next) {
        this.getRoot(function (err, root) {
            if (err) return next(err);
            var imOwner = (root.owner._id.toString() == user._id.toString());

            var sharedToMe = _.find(root.team, function (userId) {
                return userId.toString() == user._id.toString();
            });

            if (imOwner || sharedToMe) {
                next(null, true);
            } else {
                next(null, false);
            }
        });
    },
    countChildren: function (next) {
        Task.count({parentTaskId: this._id}, next);
    },
    removeFiles: function (next) {
        next = next || new Function();
        GridFS.remove(this.files, next);
    },
    connectFiles: function (next) {
        next = next || new Function();
        GridFS.connect(this.files, next);
    },
    updateRootTags: function (next) {
        next = next || new Function();

        var self = this;

        var originTags = self._origin && self._origin.tags || [];

        var glue = '|||';

        var tagsModified =
            (self.tags.length || originTags.length)
            && (self.tags.join(glue) != originTags.join(glue));

        if (!tagsModified) return next();

        this.getRoot(function (err, root) {
            if (err) return next(err);

            root.tagsList = _.uniq(root.tagsList.concat(self.tags));

            root.save(function (err) {
                if (err) return next(err);
                next();
            });
        });

    }


};

TaskSchema.post('save', function (task) {
    task.updateParent();
    task.connectFiles();
    task.updateRootTags();
});

TaskSchema.post('remove', function (task) {
    task.updateParent();
    task.removeChildren();
    task.removeFiles();
});

var Task = mongoose.model('Task', TaskSchema);


module.exports = Task;
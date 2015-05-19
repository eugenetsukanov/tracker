var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');

var TaskSchema = new Schema({
    title: String,
    description: String,
    user: String,
    description: {type: String, default: null },
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
    developer: {type: Schema.Types.ObjectId, ref: "User"}
});

TaskSchema.set('toJSON', {getters: true, virtuals: true});

TaskSchema.pre('init', function (next, task) {
    this.calculateEstimatedTime(task, next);
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
        if (this.simple) return next();

        this.getChildren(function (err, tasks) {
            if (err) return next(err);

            var estimatedTime = 0;

            tasks.forEach(function (task) {
                estimatedTime += task.estimatedTime;
            });

            this.estimatedTime = estimatedTime;
            this.timeToDo = this.estimatedTime  - this.spenttime;

            next();
        }.bind(this));
    },
    updateParent: function (next) {
        next = next || new Function;

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
                if (task.status == 'in progress'){
                    countInProgress += 1;
                }  else if (task.status == 'accepted'){
                    countAccepted += 1;
                } else {
                    countNew += 1;
                }
            });

            if ( (countInProgress > 0 || (countAccepted > 0 && countAccepted < tasks.length))){
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
        if (this.complexity) {
            var row = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
            var points = row[this.complexity];
            this.points = points;
        }

        if (this.points && this.spenttime && this.isAccepted()) {
            this.velocity = this.points / this.spenttime;
        }

        next();
    },

    calculateSimpleTaskEstimatedTime: function (task, next) {

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

                    task.timeToDo = task.estimatedTime  - task.spenttime;

                    next();
                });
            });
        } else {
            next();
        }
    },
    calculateEstimatedTime: function (task, next) {
        if (task._id && task.simple) {
            this.calculateSimpleTaskEstimatedTime(task, next);
        } else {
            next()
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
        Task.find({parentTaskId: this}, function (err, tasks) {
            if (err) return next(err);

            next(null, tasks);
        })
    },

    getChildrenChanged: function (query, next) {
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
    getGrandParent: function (next) {
        this.getParent(function (err, parent) {
            if (err) return next(err);
            if(!parent) return next(null, null);
            parent.getParent(next);
        });
    },
    isAccepted: function () {
        return this.status == 'accepted';
    },
    countChildren: function (next) {
        Task.count({parentTaskId: this._id}, next);
    }


};

TaskSchema.post('save', function (task) {
    task.updateParent();
});

TaskSchema.post('remove', function (task) {
    task.updateParent();
});

TaskSchema.post('remove', function (task) {
    task.removeChildren();
});

var Task = mongoose.model('Task', TaskSchema);


module.exports = Task;
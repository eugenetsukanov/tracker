var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TaskSchema = new Schema({
    title: String,
    user: String,
    priority: {type: Number, default: 0},
    status: String,
    spenttime: {type: Number, default: 0},
    complexity: {type: Number, default: 0},
    points: {type: Number, default: 0},
    velocity: {type: Number, default: 0},
    parentTaskId: {type: Schema.Types.ObjectId, ref: "Task", default: null},
    date: {type: Date, default: Date.now},
    simple: {type: Boolean, default: true},
    estimatedTime: {type: Number, default: 0}
});

TaskSchema.set('toJSON', {getters: true, virtuals: true});

TaskSchema.pre('init', function (next, task) {
    this.calculateEstimatedTime(task, next);
});

TaskSchema.pre('save', function (next) {
    this.calculate(next);
});

TaskSchema.pre('save', function (next) {
    this.initEstimatedTime(next);
});

TaskSchema.methods = {

    checkSimple: function (next) {

        return Task.count({parentTaskId: this._id}, function (err, tasks) {
            if (err) return console.log(err);

            next(null, tasks == 0);

        })
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

    updateParent: function () {

        this.getParent(function (err, task) {
            if (err) return console.log(err);

            task && task.save(new Function);
        });

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

                    if (velocity) {
                        var prevEstimatedTime = task.estimatedTime || 0;
                        task.estimatedTime = task.points / velocity;

                        var diffTime = task.estimatedTime - prevEstimatedTime;

                        if (diffTime) {
                            Task.updateEstimateTime(task._id, task.estimatedTime, function () {
                                Task.updateParentEstimateTime(task.parentTaskId, diffTime, next);
                            });
                        }
                        else {
                            next();
                        }
                    } else {
                        next();
                    }
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

    getSiblings: function (next) {
        if (this.parentTaskId) {
            Task.find({parentTaskId: this.parentTaskId, _id: {$ne: this}}, function (err, tasks) {
                if (err) return next(err);

                next(null, tasks);
            });
        }
        else {
            next(null, []);
        }
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
    isAccepted: function () {
        return this.status == 'accepted';
    },
    initEstimatedTime: function (next) {
        if (this.simple) return next();

        this.getChildren(function (err, tasks) {
            if (err) return next(err);
            if (tasks.length == 1) {
                Task.updateParentEstimateTime(this._id, -this.estimatedTime, function () {
                    this.estimatedTime = tasks[0].estimatedTime;
                    next();
                }.bind(this));
            }
            else {
                next();
            }

        }.bind(this));
    }


};

TaskSchema.statics.updateParentEstimateTime = function (parentTaskId, diffTime, next) {
    next = next || new Function;

    if (!diffTime) return next();
    if (!parentTaskId) return next();

    Task.update({_id: parentTaskId}, {$inc: {estimatedTime: diffTime}}, {}, function () {

        Task.findById(parentTaskId, function (err, parent) {
            if (err) return next(err);
            if (!parent) return next();

            if (parent.parentTaskId) {
                Task.updateParentEstimateTime(parent.parentTaskId, diffTime, next);
            }
            else {
                next()
            }

        });

    });


}
TaskSchema.statics.updateEstimateTime = function (taskId, estimatedTime, next) {
    next = next || new Function;

    Task.update({_id: taskId}, {$set: {estimatedTime: estimatedTime}}, {}, next);
}

TaskSchema.post('save', function (task) {
    task.updateParent();
});

TaskSchema.post('remove', function (task) {
    task.updateParent();
});

TaskSchema.post('remove', function (task) {
    task.removeChildren();
});

TaskSchema.post('remove', function (task) {
    Task.updateParentEstimateTime(task.parentTaskId, -task.estimatedTime);
});

var Task = mongoose.model('Task', TaskSchema);


module.exports = Task;
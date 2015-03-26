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

TaskSchema.pre('save', function (next) {
    this.calculate(next);
});

TaskSchema.methods = {

    checkSimple: function (next) {

        return Task.count({parentTaskId: this._id}, function (err, tasks) {
            if (err) return console.log(err);

            next(null, tasks == 0);

        })
    },

    recalculateParent: function () {

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
                this.estimatedTime = totalPoints/velocity;
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

    removeChildren: function () {
        this.getChildren(function (err, tasks) {
            tasks.forEach(function (task) {
                task.remove(new Function);
            })
        });
    },

    getChildren: function (next) {
        Task.find({ parentTaskId: this}, function (err, tasks) {
            if (err) return next(err);

            next(null, tasks);
        })
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
    }


};

TaskSchema.post('save', function (task) {
    task.recalculateParent();
});

TaskSchema.post('remove', function (task) {
    task.recalculateParent();
});

TaskSchema.post('remove', function (task) {
    task.removeChildren();
});

var Task = mongoose.model('Task', TaskSchema);


module.exports = Task;
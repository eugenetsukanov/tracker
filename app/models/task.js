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
    simple: {type: Boolean, default: true}
});

TaskSchema.pre('save', function (next) {

    this.checkSimple(function (err, simple) {
        this.simple = simple;

        if (simple) {

            if (this.complexity) {
                var row = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
                var points = row[this.complexity];
                this.points = points;
            }

            if (this.points && this.spenttime) {
                this.velocity = this.points / this.spenttime;
            }

            next();

        } else {
            this.calculate(next);
        }

    }.bind(this));

});

TaskSchema.methods = {

    checkSimple: function (next) {

        return Task.count({parentTaskId: this._id}, function (err, tasks) {
            if (err) return console.log(err);

            next(null, tasks == 0);

        })
    },

    recalculateParentSimple: function () {

        if (this.parentTaskId) {

            Task.findById(this.parentTaskId, function (err, task) {
                if (err) return console.log(err);

                task && task.save(function () {

                });

            });

        }
    },

    calculate: function (next) {

        if (!this.simple) {

            Task.find({ parentTaskId: this._id }, function (err, tasks) {
                if (err) return console.log(err);

                var spentTime = 0,
                    points = 0,
                    velocity = 0;

                tasks.forEach(function (task) {

                    spentTime += task.spenttime;
                    points += task.points;

                });

                if (spentTime && points) {
                    velocity = points / spentTime;
                }

                this.spenttime = spentTime;
                this.points = points;
                this.velocity = velocity;

                next();

            }.bind(this))

        }

    }


};

TaskSchema.post('save', function (task) {
    task.recalculateParentSimple();
});

TaskSchema.post('remove', function (task) {
    task.recalculateParentSimple();
});

TaskSchema.post('remove', function (task) {

    Task.find({ parentTaskId: task}, function (err, tasks) {
        if (err) return console.error(err);

        tasks.forEach(function (task) {
            task.remove(function () {

            });
        })

    })

});

var Task = mongoose.model('Task', TaskSchema);


module.exports = Task;
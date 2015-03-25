var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TaskSchema = new Schema({
    title: String,
    user: String,
    priority: Number,
    status: String,
    spenttime: Number,
    complexity: Number,
    points: Number,
    velocity: Number,
    parentTaskId: {type: Schema.Types.ObjectId, ref: "Task", default: null},
    date: {type: Date, default: Date.now},
    simple: {type: Boolean, default: true}
});

TaskSchema.pre('save', function (next) {

    if (this.complexity) {
        var row = [0,1,2,3,5,8,13,21,34,55,89,144];
        var points = row[this.complexity];
        this.points = points;
    }

    if (this.points && this.spenttime) {
        this.velocity = this.points / this.spenttime;
    }

    this.checkSimple(function (err, simple) {
        this.simple = simple;
        next();
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
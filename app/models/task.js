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
    date: {type: Date, default: Date.now}
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

TaskSchema.pre('save', function (next) {

    if (this.complexity) {
        var row = [0,1,2,3,5,8,13,21,34,55,89,144];
        var points = row[this.complexity];
        this.points = points;
    }
    next();
});

var Task = mongoose.model('Task', TaskSchema);


module.exports = Task;
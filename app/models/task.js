var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TaskSchema = new Schema({
    title: String,
    user: String,
    priority: Number,
    status: String,
    spendtime: Number,
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

var Task = mongoose.model('Task', TaskSchema);


module.exports = Task;
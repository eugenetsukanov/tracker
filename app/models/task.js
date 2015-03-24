var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TaskSchema = new Schema({
    title: String,
    user: String,
    priority: Number,
    status: String,
    spendtime: Number,
    velocity: Number,
    date: {type: Date, default: Date.now}
});

var Task = mongoose.model('Task', TaskSchema);


module.exports = Task;
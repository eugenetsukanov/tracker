module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var _ = require('lodash');

    var FileSchema = require('./file.schema');

    var TaskSchema = new Schema({
        title: String,
        description: String,
        user: String,
        priority: {type: Number, default: 5, index: true},
        status: {type: String, default: ''},
        spenttime: {type: Number, default: 0},
        complexity: {type: Number, default: 0},
        points: {type: Number, default: 0},
        velocity: Number,
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

    TaskSchema.methods = {
        isAccepted: function () {
            return this.status === 'accepted';
        }
    };

    TaskSchema.set('toJSON', {getters: true, virtuals: true});

    TaskSchema.pre('init', function (next, task) {
        this._origin = _.merge({}, task);
        next();
    });

    TaskSchema.pre('save', function (next) {
        this.updatedAt = Date.now();
        next();
    });

    var Task = mongoose.model('Task', TaskSchema);

    return Task;
};
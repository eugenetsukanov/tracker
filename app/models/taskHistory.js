module.exports = function (mongoose) {
    var Schema = mongoose.Schema;

    var TaskHistorySchema = new Schema({
        task: {type: Schema.Types.ObjectId, ref: "Task", default: null},
        user: {type: Schema.Types.ObjectId, ref: "User", default: null},
        updatedAt: {type: Date, default: Date.now, index: true}
    }, {discriminatorKey:'_type'});

    TaskHistorySchema.pre('save', function (next) {
        this.updatedAt = Date.now();
        next();
    });

    var TaskHistory = mongoose.model('TaskHistory',TaskHistorySchema);

    return TaskHistory;
};

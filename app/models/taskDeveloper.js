module.exports = function (mongoose, TaskHistory) {
    var Schema = mongoose.Schema;

    var TaskDeveloperSchema = new mongoose.Schema({
            developer: {type: Schema.Types.ObjectId, ref: "User"}
        },
        {discriminatorKey: '_type'}
    );

    return TaskHistory.discriminator('TaskDeveloper', TaskDeveloperSchema);
};
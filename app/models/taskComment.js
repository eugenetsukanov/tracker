module.exports = function (mongoose, TaskHistory) {

    var TaskCommentSchema = new mongoose.Schema({
            text: String
        },
        {discriminatorKey: '_type'}
    );

    return TaskHistory.discriminator('TaskComment', TaskCommentSchema);
};
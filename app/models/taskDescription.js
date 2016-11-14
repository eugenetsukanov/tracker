module.exports = function (mongoose, TaskHistory) {

    var TaskDescriptionSchema = new mongoose.Schema({
            text: String
        },
        {discriminatorKey: '_type'}
    );

    return TaskHistory.discriminator('TaskDescription', TaskDescriptionSchema);
};
module.exports = function (mongoose, TaskHistory) {
    var _ = require('lodash');

    var TaskStatusSchema = new mongoose.Schema({
            status: {type: String, default: ''}
        },
        {discriminatorKey: '_type'}
    );
    return TaskHistory.discriminator('TaskStatus', TaskStatusSchema);
};

module.exports = function (mongoose, TaskHistory) {
    var _ = require('lodash');

    var TaskSpenttimeSchema = new mongoose.Schema({
            spenttime: {type: Number, default: 0}
        },
        {discriminatorKey: '_type'}
    );
    return TaskHistory.discriminator('TaskSpenttime', TaskSpenttimeSchema);
};

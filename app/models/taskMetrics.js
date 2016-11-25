module.exports = function (mongoose, TaskHistory) {
    var _ = require('lodash');

    var TaskMetricsSchema = new mongoose.Schema({
            estimatedTime: {type: Number, default: 0},
            velocity: Number
        },
        {discriminatorKey: '_type'}
    );

    return TaskHistory.discriminator('TaskMetrics', TaskMetricsSchema);
};

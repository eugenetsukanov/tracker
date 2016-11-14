module.exports = function (mongoose, TaskHistory) {

    var TaskComplexitySchema = new mongoose.Schema({
            complexity: {type: Number, default: 0},
            points: {type: Number, default: 0}
        },
        {discriminatorKey: '_type'}
    );

    return TaskHistory.discriminator('TaskComplexity', TaskComplexitySchema);
};
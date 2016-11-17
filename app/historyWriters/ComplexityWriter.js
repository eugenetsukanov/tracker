module.exports = function (TaskComplexity) {

    function ComplexityWriter(task) {

        var self = this;
        this.task = task;

        this.isUpdated = function () {
            return this.task.points && this.task._origin && this.task._origin.points !== this.task.points;
        };

        this.isNew = function () {
            return !this.task._origin && this.task.points;
        };

        this.getModel = function () {
            return new TaskComplexity({

                task: self.task._id,
                user: self.task.updatedBy ? self.task.updatedBy : self.task.owner,
                complexity: self.task.complexity,
                points: self.task.points

            });
        };

        this.write = function (next) {
            if (this.isUpdated() || this.isNew()) {
                this.getModel().save(next);
            } else {
                next();
            }
        };
    }

    return ComplexityWriter;

};

module.exports.$tags = ['taskHistoryWriter'];
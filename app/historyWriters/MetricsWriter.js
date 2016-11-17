module.exports = function (TaskMetrics) {

    function MetricsWriter(task) {
        var self = this;
        this.task = task;

        this.isUpdated = function () {
            if (this.task._origin){
                var estimatedTimeUpdated = this.task._origin.estimatedTime !== this.task.estimatedTime;
                var velocityUpdated = this.task._origin.velocity !== this.task.velocity;
                return this.task._origin && (estimatedTimeUpdated || velocityUpdated);
            }
            return false;
        };

        this.isNew = function () {
            return !this.task._origin && (this.task.estimatedTime || this.task.velocity);
        };

        this.getModel = function () {
            return new TaskMetrics({
                task: self.task._id,
                user: self.task.updatedBy ? self.task.updatedBy : self.task.owner,
                estimatedTime: self.task.estimatedTime,
                velocity: this.task.velocity ? this.task.velocity : null

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

    return MetricsWriter;

};

module.exports.$tags = ['taskHistoryWriter'];
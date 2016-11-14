module.exports = function (TaskStatus) {

    function StatusWriter(task) {

        var self = this;
        this.task = task;

        this.isUpdated = function () {
            return this.task._origin && this.task._origin.status !== this.task.status;
        };

        this.isNew = function () {
            return this.task._origin ? false : true;
        };

        this.getModel = function () {
            return new TaskStatus({
                task: self.task._id,
                user: self.task.updatedBy ? self.task.updatedBy : self.task.owner,
                status: self.task.status
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

    return StatusWriter;

};

module.exports.$tags = ['taskHistoryWriter'];
module.exports = function (TaskSpenttime) {

    function SpenttimeWriter(task) {
        var self = this;
        this.task = task;

        this.isUpdated = function () {
            return this.task.spenttime && this.task._origin && this.task._origin.spenttime !== this.task.spenttime;
        };

        this.isNew = function () {
            return !this.task._origin && this.task.spenttime ;
        };

        this.getModel = function () {
            return new TaskSpenttime({
                task: self.task._id,
                user: self.task.updatedBy ? self.task.updatedBy : self.task.owner,
                spenttime: self.task.spenttime
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

    return SpenttimeWriter;
};

module.exports.$tags = ['taskHistoryWriter'];

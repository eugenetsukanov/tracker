module.exports = function (TaskDescription) {

    function DescriptionWriter(task) {

        var self = this;
        this.task = task;

        this.isUpdated = function () {
            return this.task.description && this.task._origin && this.task._origin.description !== this.task.description;
        };

        this.isNew = function () {
            return !this.task._origin && this.task.description;
        };

        this.getModel = function () {
            return new TaskDescription({
                task: self.task._id,
                user: self.task.updatedBy ? self.task.updatedBy : self.task.owner,
                text: self.task.description
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

    return DescriptionWriter;

};

module.exports.$tags = ['taskHistoryWriter'];
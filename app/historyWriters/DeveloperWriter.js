module.exports = function (TaskDeveloper) {

    function DeveloperWriter(task) {

        var self = this;
        this.task = task;

        this.isUpdated = function () {
            var origin = this.task._origin;
            var developer = this.task.developer;
            return developer && origin && origin.developer&& origin.developer._id.toString() !== developer.toString();
        };
        this.isNew = function () {
            return !this.task._origin && this.task.developer;
        };

        this.getModel = function () {
            return new TaskDeveloper({
                task: self.task._id,
                user: self.task.updatedBy ? self.task.updatedBy : self.task.owner,
                developer: self.task.developer
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
    return DeveloperWriter;
};

module.exports.$tags = ['taskHistoryWriter'];


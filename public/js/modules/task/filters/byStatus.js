angular
    .module('Tracker')
    .filter('byStatus', function () {

        return function (tasks, status) {
            if (!tasks) return [];
            var result = [];
            tasks.forEach(function (task) {
                if (task.status == status) {
                    result.push(task);
                }
            });
            return result;
        };

    })

;
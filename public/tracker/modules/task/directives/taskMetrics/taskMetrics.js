angular
    .module('Tracker')

    .directive('taskMetrics', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/modules/task/directives/taskMetrics/taskMetrics.html',
            scope: {
                task: "=task",
                options: "=taskOptions"
            }
        }
    });
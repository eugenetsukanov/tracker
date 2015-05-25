angular
    .module('Tracker')

    .directive('taskMetrics', function () {
        return {
            restrict: 'A',
            templateUrl: 'js/modules/task/directives/taskMetrics/taskMetrics.html',
            scope: {
                task: "=task"
            }
        }
    });
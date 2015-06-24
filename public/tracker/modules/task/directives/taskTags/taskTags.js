angular
    .module('Tracker')
    .directive('taskTags', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/modules/task/directives/taskTags/taskTags.html',
            scope: {
                task: "=task"
            }
        }
    });
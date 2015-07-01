angular
    .module('Tracker')
    .directive('taskPanel', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/modules/task/directives/taskPanel/taskPanel.html',
            controller: function ($scope) {
                $scope.edit = function (task) {
                    if ($scope.onEdit) {
                        $scope.onEdit(task);
                    }
                }
            },
            scope: {
                task: "=task",
                metricsToggle: "=metricsToggle",
                onEdit: "=taskOnEdit",
                options: "=taskOptions"
            }
        }
    });
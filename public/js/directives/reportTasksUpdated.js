angular
    .module('Tracker')

    .directive('reportTasksUpdated', function (ReportByTaskId, ReportByDate) {

        return {
            restrict: 'E',
            templateUrl: 'templates/report/tasks-updated.html',
            scope: {
                taskId: '=',
                date: '=',
                metrics: '=',
                status: '='
            },
            controller: function ($scope) {

                if ($scope.taskId) {
                    ReportByTaskId.query({taskId: $scope.taskId}, function (tasks) {
                        $scope.tasks = tasks;
                    })
                } else {

                    var date = $scope.date || new Date();

                    var getTasks = function (date) {
                        ReportByDate.query({date: date}, function (tasks) {
                            $scope.tasks = tasks;
                        });
                    };

                    $scope.$watch('date', function (date) {
                        getTasks(date);
                    })
                }

            }
        }

    })
;
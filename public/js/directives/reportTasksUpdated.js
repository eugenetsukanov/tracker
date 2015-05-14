angular
    .module('Tracker')

    .directive('reportTasksUpdated', function (TaskReport, TaskReportByDate) {

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
                    TaskReport.query({taskId: $scope.taskId}, function (tasks) {
                        $scope.tasks = tasks;
                    })
                } else {

                    var date = $scope.date || new Date();

                    var getTasks = function (date) {
                        TaskReportByDate.query({date: date}, function (tasks) {
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
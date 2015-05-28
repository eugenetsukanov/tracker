angular
    .module('Tracker')

    .directive('reportTasksUpdated', function (ReportByTaskId, ReportByDate) {

        return {
            restrict: 'E',
            templateUrl: 'tracker/directives/reports/reportTasksUpdated.html',
            scope: {
                taskId: '=',
                date: '=?',
                metrics: '=',
                status: '='
            },
            controller: function ($scope) {

                $scope.date = $scope.date || new Date();

                $scope.openDatePicker = function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.opened = true;
                };

                var getTasks = function (date) {

                    if ($scope.taskId) {

                        ReportByTaskId.query({taskId: $scope.taskId, date: date}, function (tasks) {
                            $scope.tasks = tasks;
                        });

                    } else {

                        ReportByDate.query({date: date}, function (tasks) {
                            $scope.tasks = tasks;
                        });

                    }

                };

                $scope.$watch('date', function (date) {
                    $scope.date = date || new Date();
                    getTasks($scope.date);
                });


            }
        }

    })
;
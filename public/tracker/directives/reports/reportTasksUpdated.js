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
                status: '=',
                userId: '=userId'
            },

            controller: function ($scope, $stateParams, Team) {

                $scope.taskId = $stateParams.taskId;

                $scope.developer = $scope.userId || '';
                $scope.team = [];

                $scope.date = $scope.date || new Date();

                $scope.openDatePicker = function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.opened = true;
                };

                if ($scope.taskId) {

                    Team.query({taskId: $stateParams.taskId}, function (team) {

                        team.forEach(function (member) {
                            $scope.team.push({
                                id: member._id,
                                username: member.local.username
                            });
                        });

                    });
                }

                var getTasks = function (date) {

                    if ($scope.taskId) {

                        ReportByTaskId.query({taskId: $scope.taskId, date: date, userId: $scope.developer }, function (tasks) {
                            $scope.tasks = tasks;
                        });

                    } else {

                        ReportByDate.query({date: date}, function (tasks) {
                            $scope.tasks = tasks;
                        });

                    }
                };

                $scope.update = function (dev) {
                    $scope.developer = dev;
                    getTasks($scope.date);
                };

                $scope.$watch('date', function (date) {
                    $scope.date = date || new Date();
                    getTasks($scope.date);
                });

                $scope.$watch('taskId', function (taskId) {
                    $scope.taskId = taskId;
                });

            }
        }

    })
;
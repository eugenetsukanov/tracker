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

            controller: function ($scope, $stateParams, $rootScope, Team, User, Task, TitleService) {

                $scope.taskId = $stateParams.taskId;

                $scope.developer = $scope.userId || '';
                //@TODO review and refactor this controller to TitleSerivce

                $scope.team = [];

                $scope.date = $scope.date || new Date();

                $scope.openDatePicker = function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.opened = true;
                };

                if ($scope.taskId) {

                    Team.query({taskId: $scope.taskId}, function (team) {

                        team.forEach(function (member) {
                            $scope.team.push({
                                id: member._id,
                                name: member.name
                            });
                        });

                    });
                }

                var getTasks = function (date) {

                    if ($scope.taskId) {

                        ReportByTaskId.query({
                            taskId: $scope.taskId,
                            date: date,
                            userId: $scope.developer
                        }, function (tasks) {
                            $scope.tasks = tasks;
                        });

                    } else {

                        ReportByDate.query({date: date}, function (tasks) {
                            $scope.tasks = tasks;
                        });

                    }
                };

                var setTitle = function (developer) {

                    if (developer) {
                        User.get({nested: developer}, function (user) {
                            if (user) {
                                TitleService.setTitle(user.name);
                            }
                        });

                    } else {
                        TitleService.setTitle('All');
                    }

                    Task.get({taskId: $stateParams.taskId}, function (task) {
                        TitleService.setPrefix(task.title);
                    });

                };

                $scope.update = function (developer) {
                    $scope.developer = developer;
                    getTasks($scope.date);
                    setTitle(developer);
                };

                if ($scope.developer) {
                    setTitle($scope.developer)
                }

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
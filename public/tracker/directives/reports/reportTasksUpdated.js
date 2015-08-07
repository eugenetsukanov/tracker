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

            controller: function ($scope, $stateParams, $rootScope, Team, User, Task) {

                $scope.taskId = $stateParams.taskId;

                $scope.developer = $scope.userId || '';
                //@TODO review and refactor this controller to TitleSerivce
                //@TODO why we should share developer to rootScope?
                $rootScope.developer = $scope.developer;

                var reportFor = 'All';

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

                var setTitle = function (dev) {
                    //@TODO not need to use `dev`; naming to `developer`

                    if (dev) {
                        User.get({nested: dev}, function (user) {
                            if (user) {
                                reportFor = user.name;
                            }
                        });

                    } else {
                        reportFor = 'All';
                    }
                    Task.get({taskId: $stateParams.taskId}, function (task) {
                        //@TODO incorrect way $rootScope.trackerTitle
                        // refactor this to TitleSerivce
                        $rootScope.trackerTitle = '(' + reportFor + '): ' + task.title;
                    });

                };

                $scope.update = function (dev) {
                    //@TODO remove $rootScope.developer
                    $rootScope.developer = dev;
                    $scope.developer = dev;
                    getTasks($scope.date);
                    setTitle(dev);
                };

                if ($scope.developer) setTitle($scope.developer);

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
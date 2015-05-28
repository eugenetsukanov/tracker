angular
    .module('Tracker')

    .directive('taskEditor', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/modules/task/directives/taskEditor/taskEditor.html',
            controller: function ($scope,
                                  Task,
                                  TaskMove,
                                  TaskComplexity,
                                  UserService,
                                  Team) {

                $scope.statuses = [
                    {name: 'New', value: ""},
                    {name: 'In Progress', value: "in progress"},
                    {name: 'Accepted', value: "accepted"}
                ];

                $scope.priorities = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

                $scope.addTimeList = [
                    {
                        name: '5m',
                        value: 0.1
                    },
                    {
                        name: '15m',
                        value: 0.25
                    },
                    {
                        name: '30m',
                        value: 0.5
                    },
                    {
                        name: '1h',
                        value: 1
                    }
                ];

                $scope.complexities = TaskComplexity;

                $scope.users = UserService.getUsers();

                $scope.$watch('task', function (task) {

                    if (task) {
                        init();
                    }

                });

                var init = function () {

                    if ($scope.task._id || $scope.task.parentTaskId) {

                        var id = $scope.task._id || $scope.task.parentTaskId;

                        Team.query({taskId: id}, function (team) {
                            $scope.team = team;
                        });

                    }

                    if ($scope.task.developer && $scope.task.developer._id) {
                        $scope.task.developer = $scope.task.developer._id;
                    }

                    $scope.tasksForMove = [];

                };


                $scope.onComplete = function () {
                    if ($scope.taskOnComplete) {
                        $scope.taskOnComplete();
                    }
                };

                $scope.save = function () {

                    if (!$scope.task._id) {

                        // new task
                        if ($scope.task.parentTaskId) {

                            //child
                            $scope.task.$save({
                                taskId: $scope.task.parentTaskId,
                                nested: 'tasks'
                            }).then(init).then($scope.onComplete);

                        } else {
                            // root
                            $scope.task.$save().then(init).then($scope.onComplete);
                        }
                    }

                    else {
                        //update
                        $scope.task.$update().then(init).then($scope.onComplete);
                    }

                };

                $scope.delete = function (task) {
                    task.$delete().then($scope.onComplete);
                };

                $scope.close = function () {
                    init();
                    $scope.onComplete();
                };

                $scope.getTasksForMove = function () {
                    if ($scope.task) {
                        TaskMove.query({taskId: $scope.task._id}, function (tasks) {
                            $scope.tasksForMove = tasks;
                        });
                    }

                };

                $scope.move = function (task) {
                    new TaskMove().$update({
                        taskId: $scope.task._id,
                        parentTaskId: task._id
                    }).then(init).then($scope.onComplete);
                };

                $scope.addTime = function (time) {
                    if ($scope.task) {
                        var spenttime = parseFloat($scope.task.spenttime || 0);
                        spenttime += time.value;

                        spenttime = parseInt(Math.ceil(spenttime * 100)) / 100;
                        $scope.task.spenttime = spenttime;
                    }
                };
            },
            scope: {
                task: "=task",
                taskOnComplete: '=taskOnComplete'
            }
        }
    })
;

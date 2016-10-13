angular
    .module('Tracker')

    .directive('taskEditor', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/modules/task/directives/taskEditor/taskEditor.html',
            controller: function ($scope,
                                  $state,
                                  $stateParams,
                                  Task,
                                  TaskMove,
                                  TaskComplexity,
                                  UserService,
                                  Team,
                                  toaster,
                                  TaskFile,
                                  TagsList) {

                $scope.statuses = [
                    {name: 'New', value: ""},
                    {name: 'In Progress', value: "in progress"},
                    {name: 'Accepted', value: "accepted"}
                ];

                if ($stateParams.taskId) {
                    $scope.taskId = $stateParams.taskId;
                }

                $scope.priorities = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

                $scope.addTimeList = [
                    {
                        name: '5m',
                        value: 0.085
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

                var oldSpenttime;

                $scope.$watch('task', function (task) {

                    if (task) {
                        init();
                    }

                });

                var init = function () {

                    $scope.tagsList = [];
                    if ($scope.task._id || $scope.task.parentTaskId) {


                        var id = $scope.task._id || $scope.task.parentTaskId;

                        Team.query({taskId: id}, function (team) {
                            $scope.team = team;
                        });

                        $scope.tagsList = TagsList.query({taskId: id});
                    }

                    if ($scope.task.status != 'accepted') {
                        $scope.task.archived = false;
                    }

                    if ($scope.task.developer && $scope.task.developer._id) {
                        $scope.task.developer = $scope.task.developer._id;
                    }

                    $scope.tasksForMove = [];
                    oldSpenttime = $scope.task.spenttime;

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
                    //delete itself
                    if ($stateParams.taskId == task._id) {
                        var parentTaskId = task.parentTaskId || null;
                        task.$delete().then(function () {
                            if (parentTaskId) {
                                $state.go('app.task', {taskId: parentTaskId});
                            } else {
                                $state.go('app.tasks');
                            }
                        }).then($scope.onComplete);

                    } else {
                        task.$delete().then($scope.onComplete);
                    }
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

                var flag = 0;
                $scope.addTime = function (time) {
                    if ($scope.task) {
                        var spenttime = parseFloat($scope.task.spenttime || 0);
                        spenttime += time.value;

                        if (time.name === '5m') {
                            flag ++;

                            if (flag === 3) {
                                spenttime = parseInt(spenttime * 100) / 100;
                                flag = 0;

                            }else{
                                spenttime = parseInt(spenttime * 1000) / 1000;
                            }
                        }

                        $scope.task.spenttime = spenttime;

                    }
                };

                $scope.reset = function () {
                    $scope.task.spenttime = oldSpenttime;
                };

                $scope.deleteFile = function (file) {

                    var removeFileUI = function () {
                        _.remove($scope.task.files || [], function (aFile) {
                            return aFile._id == file._id;
                        });
                    };

                    if ($scope.task._id) {

                        TaskFile.delete({taskId: $scope.task._id, fileId: file._id}, function () {
                            removeFileUI();
                            toaster.pop({
                                type: 'info',
                                title: 'Deleted'
                            });
                        }, function () {
                            toaster.pop({
                                type: 'error',
                                title: 'Wasn\'t deleted'
                            });
                        });
                    } else {
                        removeFileUI();
                    }
                }

            },
            scope: {
                task: "=task",
                taskOnComplete: '=taskOnComplete'
            }
        }
    })
;

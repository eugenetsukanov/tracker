angular
    .module('Tracker')

    .controller('TaskCtrl', function (
        $scope,
        Task,
        $stateParams,
        taskComplexity,
        TaskMove,
        $state,
        UserService,
        $location,
        $anchorScroll,
        Team) {


        $scope.views = [
            {title: 'Board', name: 'board'},
            {title: 'List', name: 'list'},
            {title: 'Tree', name: 'tree'}
        ];

        $scope.view = $scope.views[0];

        $scope.report = {
            title: 'Report',
            name: "report"
        };

        $scope.statuses = [
            {name: 'New', value: ""},
            {name: 'In Progress', value: "in progress"},
            {name: 'Accepted', value: "accepted"}
        ];

        $scope.loadView = function (view) {
            $scope.view = view;
        };

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

        $scope.complexities = taskComplexity;

        $scope.users = UserService.getUsers();

        $scope.taskId = $stateParams.taskId;

        var init = function () {

            if ($scope.taskId) {

                Team.query({taskId: $scope.taskId}, function (team) {
                    $scope.team = team;
                });

                Task.query({taskId: $scope.taskId, nested: 'tasks'}, function (tasks) {
                    $scope.tasks = tasks;
                    Task.get({taskId: $scope.taskId}, function (task) {
                        $scope.task = task;
                        if (task.parentTaskId) {
                            Task.get({taskId: task.parentTaskId}, function (parentTask) {
                                $scope.parentTask = parentTask;
                            });
                        }
                    });

                }, function () {
                    $state.go('app.tasks');
                });
            } else {
                Task.query(function (tasks) {
                    $scope.tasks = tasks;
                });
            }

            $scope.newTask = new Task({
                simple: true,
                developer: UserService.getUser()._id,
                status: "",
                priority: 5,
                parentTaskId: $scope.taskId || null,
                files: [],
                team: []
            });

            $scope.tasksForMove = [];

        };

        init();

        $scope.save = function () {

            if (!$scope.newTask._id) {

                if ($scope.taskId) {
                    $scope.newTask.$save({taskId: $scope.taskId, nested: 'tasks'}).then(init);
                } else {
                    $scope.newTask.$save().then(init);
                }
            }

            else {
                $scope.newTask.$update().then(init);
            }

        };

        $scope.edit = function (task) {
            $scope.newTask = task;

            Team.query({taskId: task._id}, function (team) {
                $scope.team = team;
            });

            var scrollTop = function () {
                $location.hash('navBar');
                $anchorScroll();
            };

            scrollTop();

            if (task.developer && task.developer._id) {
                task.developer = task.developer._id;
            }
        };

        $scope.delete = function (task) {
            task.$delete().then(function () {
                init()
            });

        };

        $scope.close = function () {
            init();
        };

        $scope.getTasksForMove = function () {
            if ($scope.newTask) {
                TaskMove.query({taskId: $scope.newTask._id}, function (tasks) {
                    $scope.tasksForMove = tasks;
                })
            }


        };

        $scope.move = function (task) {
            new TaskMove().$update({taskId: $scope.newTask._id, parentTaskId: task._id}).then(init);
        };

        $scope.addTime = function (time) {
            if ($scope.newTask) {
                var spenttime = parseFloat($scope.newTask.spenttime || 0);
                spenttime += time.value;

                spenttime = parseInt(Math.ceil(spenttime * 100)) / 100;
                $scope.newTask.spenttime = spenttime;
            }
        };

    })

;


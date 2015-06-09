angular
    .module('Tracker')

    .controller('TaskCtrl', function ($sce,
                                      ModalBox,
                                      $scope,
                                      $state,
                                      $stateParams,
                                      Task,
                                      UserService) {

        $scope.views = [
            {title: 'Board', name: 'board'},
            {title: 'List', name: 'list'},
            {title: 'Tree', name: 'tree'}
        ];

        $scope.view = $scope.views[0];

        $scope.loadView = function (view) {
            $scope.view = view;
        };

        $scope.report = {
            title: 'Report',
            name: "report"
        };

        $scope.taskId = $stateParams.taskId;

        $scope.init = function () {

            if ($scope.taskId) {

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
                parentTaskId: $scope.taskId || undefined,
                files: [],
                team: []
            });

        };

        var init = $scope.init;

        init();

        $scope.edit = function (task) {

            $scope.newTask = task;

            ModalBox.show(task, init);

        };

    })

    .controller('AssignedTasksCtrl', function ($scope,
                                               ModalBox,
                                               Task,
                                               UserService,
                                               AssignedTasks) {

        var init = function () {
            $scope.assignedTasks = AssignedTasks.query({userId: UserService.getUser()._id});
        };

        $scope.$watch('UserService.getUser()._id', function (id) {
            if (id) {
                init();
            }
        });

        $scope.edit = function (task) {

            Task.get({taskId: task._id}, function (task) {
                ModalBox.show(task, init);
            });

        };

    })

    .controller('tagsFindCtrl', function ($scope,
                                          $stateParams,
                                          ModalBox,
                                          Task,
                                          UserService,
                                          TagsFind) {

        var init = function () {
            $scope.tasksByTags = TagsFind.query({taskId: $stateParams.taskId, tags: $stateParams.tags});
        };

        $scope.$watch('UserService.getUser()._id', function (id) {
            if (id) {
                init();
            }
        });

        $scope.edit = function (task) {

            Task.get({taskId: task._id}, function (task) {
                ModalBox.show(task, init);
            });

        };

    })

    .controller('gotoCurrentProjectCtrl', function ($scope,
                                                    $stateParams,
                                                    UserService,
                                                    CurrentProject,
                                                    $location,
                                                    $rootScope) {

        $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
            if (newUrl != oldUrl) {
                if ($stateParams.taskId && UserService.getUser()._id) {
                    getRoot()
                } else {
                    $scope.root = null;
                }
            }
        });

        var getRoot = function () {
            CurrentProject.get({taskId: $stateParams.taskId}, function (root) {
                $scope.root = root;
            });
        };

        if ($stateParams.taskId && UserService.getUser()._id) getRoot();

        $scope.searchRoot = function () {
            $location.path('/app/tasks/' + $scope.root._id);
        }

    })

;


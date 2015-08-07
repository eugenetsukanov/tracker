angular
    .module('Tracker')

    .controller('TaskCtrl', function ($sce,
                                      TaskEditorModal,
                                      $scope,
                                      $state,
                                      $stateParams,
                                      Task,
                                      TitleService,
                                      RootTask,
                                      UserService) {


        $scope.report = {
            title: 'Report',
            name: "report"
        };

        $scope.$watchCollection('UserService.user', function (user) {
            if (user) $scope.userId = user._id;
        });

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

                        //@@TODO this part move to gotoRootTaskCtrl, no need to load root again
                        // it should work as TitileService.setPrefix(root.title);

                        if ($state.is('app.task')) {

                            RootTask.get({taskId: task._id}, function (root) {
                                if (task._id == root._id) {
                                    TitleService.setTitle(root.title);
                                } else {
                                    TitleService.setTitle(task.title, root.title);
                                }
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

            TaskEditorModal.show(task, init);

        };


    })

    .controller('AssignedTasksCtrl', function ($scope,
                                               $stateParams,
                                               TaskEditorModal,
                                               Task,
                                               UserService,
                                               AssignedTasks) {

        $scope.init = function () {
            AssignedTasks.query({userId: $stateParams.userId}, function (tasks) {
                $scope.tasks = _.map(tasks, function (task) {
                    return new Task(task);
                });
            });
        };

        $scope.init();
    })

    .controller('tagsFindCtrl', function ($scope,
                                          $state,
                                          $stateParams,
                                          TaskEditorModal,
                                          Task,
                                          UserService,
                                          TagsList,
                                          TagsFind) {


        $scope.search = $stateParams.tags ? [$stateParams.tags] : [];

        $scope.searchQuery = function () {
            TagsFind.query({taskId: $stateParams.taskId, 'query[]': $scope.search}, function (tasks) {
                $scope.tasks = _.map(tasks, function (task) {
                    return new Task(task);
                });
            });
        };

        $scope.init = function () {

            TagsList.query({taskId: $stateParams.taskId}, function (tags) {
                $scope.tags = tags;
            });

            if ($scope.search.length){
                $scope.searchQuery();
            }
        };


        $scope.init();

        $scope.toggleTag = function (tag) {

            if ($scope.search.indexOf(tag) >= 0) {
                $scope.search.splice($scope.search.indexOf(tag), 1);
            } else {
                $scope.search.push(tag);
            }

            if ($scope.search.length) {
                $scope.searchQuery();
            }
            else {
                $scope.tasks = [];
            }
        };

        $scope.isActiveTag = function (tag) {
            return $scope.search.indexOf(tag) >= 0;
        }

    })

    .controller('gotoRootTaskCtrl', function ($scope,
                                              $stateParams,
                                              RootTask) {

        var getRoot = function () {
            RootTask.get({taskId: $stateParams.taskId}, function (root) {
                $scope.root = root;
            });
        };

        if ($stateParams.taskId) {
            getRoot();
        }

    })

    .controller('SearchCtrl', function ($scope, $stateParams, SearchService, Task) {

        $scope.init = function () {
            SearchService.search($stateParams.query).then(function (tasks) {

                $scope.taskId = SearchService.getTaskId();
                $scope.query = $stateParams.query;

                $scope.tasks = _.map(tasks, function (task) {
                    return new Task(task);
                });
            });
        };

        $scope.init();

    })

    .controller('TaskArchiveCtrl', function ($state, $scope, $stateParams, Task, ArchivedProjects, TitleService) {

        $scope.init = function () {



            if ($stateParams.taskId) {

                Task.query({taskId: $stateParams.taskId, nested: 'archive'}, function (tasks) {
                    $scope.tasks = tasks;
                });

                if ($state.is('app.tasks-archive')) {
                    Task.get({taskId: $stateParams.taskId}, function (task) {
                        if (task) {
                            TitleService.setTitle('Archive', task.title);
                        }
                    });
                }
            }
            else {

                ArchivedProjects.query({}, function (tasks) {
                    $scope.tasks = _.map(tasks, function (task) {
                        return new Task(task);
                    });
                });
            }

        };

        var init = $scope.init;

        init();

    })
;


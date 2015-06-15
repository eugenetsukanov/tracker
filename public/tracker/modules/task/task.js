angular
    .module('Tracker')

    .controller('TaskCtrl', function ($sce,
                                      TaskEditorModal,
                                      $scope,
                                      $state,
                                      $stateParams,
                                      Task,
                                      UserService){

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
                                          $stateParams,
                                          TaskEditorModal,
                                          Task,
                                          UserService,
                                          TagsFind) {

        $scope.init = function () {
            TagsFind.query({taskId: $stateParams.taskId, tags: $stateParams.tags}, function (tasks) {
                $scope.tasks = _.map(tasks, function (task) {
                    return new Task(task);
                });
            });
        };

        $scope.init();

        $scope.queryTags = $stateParams.tags;
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

    .controller('SearchCtrl', function ($scope, $stateParams, SearchService) {

        $scope.init = function () {
            SearchService.search($stateParams.query).then(function (tasks) {
                $scope.taskId = SearchService.getTaskId();
                $scope.query = $stateParams.query;
                $scope.tasks = tasks;
            });
        };

        var init = $scope.init;

        init();

    })

    .controller('TaskArchiveCtrl', function ($scope, $stateParams, Task, ArchivedProjects) {

        $scope.init = function () {

            if ($stateParams.taskId) {

                Task.query({taskId: $stateParams.taskId, nested: 'archive'}, function (tasks) {
                    $scope.tasks = tasks;
                });
            }
            else {

                ArchivedProjects.query({},function (tasks) {
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


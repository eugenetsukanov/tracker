angular
    .module('Tracker')

    .controller('TaskCtrl', function ($sce,
                                      $modal,
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
        $scope.init();


        $scope.edit = function (task) {
            $scope.newTask = task;


            var modal = $modal.open({
                size: 'lg',
                templateUrl: 'tracker/modules/task/views/task-edit-modal.html',
                controller: function ($scope) {
                    $scope.task = task;

                    $scope.done = function () {
                        init();
                        modal.close();
                    }
                }
            });

            modal.result.then(init, init);
        };

    })

    .controller('AssignedTasksCtrl', function ($scope,
                                               UserService,
                                               AssignedTasks)
    {


        if (UserService.getUser()._id) {
            $scope.assignedTasks = AssignedTasks.query({userId: UserService.getUser()._id});
        }

    })

    .controller('tagsFindCtrl', function ($scope,
                                          $stateParams,
                                          UserService,
                                          TagsFind) {

        if (UserService.getUser()._id) {
            $scope.tasksByTags = TagsFind.query({taskId: $stateParams.taskId, tags: $stateParams.tags});
        }

    })

;


angular
    .module('Tracker')
    .directive('taskViews', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/modules/task/directives/taskViews/taskViews.html',
            controller: function ($scope, TaskEditorModal) {

                $scope.views = [
                    {title: 'Board', name: 'board'},
                    {title: 'List', name: 'list'},
                    {title: 'Tree', name: 'tree'}
                ];

                $scope.view = $scope.views[0];

                $scope.loadView = function (view) {
                    $scope.view = view;
                };

                if ($scope.taskOnEdit) {
                    $scope.edit = function (task) {
                        $scope.taskOnEdit(task);
                    }
                }


                $scope.edit = function (task) {
                    TaskEditorModal.show(task, function () {
                        console.log('done');
                        if ($scope.taskOnComplete) {
                            $scope.taskOnComplete();
                        }
                    });
                };


            },
            scope: {
                tasks: "=tasks",
                taskOnComplete: "=taskOnComplete"
            }

        }
    });
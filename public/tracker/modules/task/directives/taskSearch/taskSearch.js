angular
    .module('Tracker')

    .directive('taskSearch', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/modules/task/directives/taskSearch/taskSearch.html',
            controller: function ($scope, Task, foundTasks, currentTask, $state) {

                $scope.$watch('currentTask.task', function () {
                    $scope.currentTask = currentTask;
                });


                var clearFoundTasks = function () {
                    angular.copy([], foundTasks.items)
                };
                $scope.$watch('search', function () {
                    if ($scope.search && $scope.search.length == 0) {
                        clearFoundTasks();
                    }
                    else {
                        $scope.searchQuery($scope.search);
                    }
                });

                $scope.searchQuery = function (query) {

                    var q = query ? query : '';

                    if (q.length == 0) {
                        clearFoundTasks();
                    }

                    if (q.length > 0) {
                        Task.query({taskId: $scope.currentTask.task, nested:'search', query: q}, function (tasks) {

                            foundTasks.items =tasks;

                            if (tasks.length) {
                                $state.go('app.task-search')
                            }
                            if (tasks.length == 0) {
                                $state.go('app.task', {taskId: $scope.currentTask.task})
                            }

                        });
                    }
                }

            },
            scope: {
                task: "=task"
            }
        }
    });
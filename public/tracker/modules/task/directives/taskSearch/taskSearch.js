angular
    .module('Tracker')

    .directive('taskSearch', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/modules/task/directives/taskSearch/taskSearch.html',
            controller: function ($scope, Search, foundTasks) {

                var clearFoundTasks = function () {
                    angular.copy([], foundTasks.items)
                };
                $scope.$watch('search', function () {
                   clearFoundTasks();
                });

                $scope.searchQuery = function (query) {

                    var q = query ? query.trim() : '';

                    if (q.length == 0) {
                        clearFoundTasks();
                    }

                    if (q.length > 0) {
                        Search.query({taskId: $scope.task._id, query: q}, function (tasks) {
                            $scope.foundTasks = tasks;
                            angular.copy(tasks, foundTasks.items);

                        });
                    }
                }

            },
            scope: {
                task: "=task"
            }
        }
    });
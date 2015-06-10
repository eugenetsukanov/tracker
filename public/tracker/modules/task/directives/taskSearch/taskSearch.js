angular
    .module('Tracker')

    .directive('taskSearch', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/modules/task/directives/taskSearch/taskSearch.html',
            controller: function ($scope, Search, foundTasks) {

                $scope.searchQuery = function (query) {

                    var q = query ? query.trim() : '';

                    if (q.length == 0) {
                        angular.copy([], foundTasks.items);
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
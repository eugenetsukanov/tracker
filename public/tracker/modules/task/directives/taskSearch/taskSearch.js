angular
    .module('Tracker')

    .directive('taskSearch', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/modules/task/directives/taskSearch/taskSearch.html',
            controller: function ($scope, Task, foundTasks, currentTask, $state, SearchService) {


                $scope.$watch('search', function () {
                    $scope.searchQuery($scope.search);

                });

                $scope.searchQuery = function (query) {

                    var q = query ? query : '';
                    //var items = [];

                    if (q.length) {
                        $state.go('app.task-search', {taskId: SearchService.getTaskId(), query: q});
                    }
                    else {
                        $state.go('app.task', {taskId: SearchService.getTaskId()})
                    }
                    //
                    //if (query.length) {
                    //
                    //}
                    //
                    //if (q.length == 0) {
                    //    clearFoundTasks();
                    //}
                    //
                    //if (q.length > 0) {
                    //    SearchService.search(q, function (tasks) {
                    //
                    //        foundTasks.items = tasks;
                    //
                    //    });
                    //
                    //}
                }

            },
            scope: {
                task: "=task"
            }
        }
    });
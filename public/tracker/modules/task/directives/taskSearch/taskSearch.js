angular
    .module('Tracker')

    .directive('taskSearch', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/modules/task/directives/taskSearch/taskSearch.html',
            controller: function ($scope, $state, $stateParams, SearchService) {
                $scope.stateParams = $stateParams;

                $scope.$watch('stateParams.query', function (q) {
                    if (!q) {
                        $scope.search = '';
                    }
                });

                $scope.searchQuery = function (query) {

                    var q = query ? query : '';

                    if (q.length) {
                        $state.go('app.task-search', {taskId: SearchService.getTaskId(), query: q});
                    } else {
                        $state.go('app.task', {taskId: SearchService.getTaskId()});
                    }

                }

            }
        }
    });
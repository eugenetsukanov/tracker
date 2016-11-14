angular
    .module('Tracker')

    .directive('commentsCounter', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/modules/task/directives/commentsCounter/commentsCounter.html',
            controller: function ($scope) {

                $scope.toggleTaskHistory = function ($event) {
                    $scope.openHistory = !$scope.openHistory;

                };
            },
            scope: {
                task: "=task",
                openHistory: "="
            }
        }
    });

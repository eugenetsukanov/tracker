angular
    .module('Tracker')

    .directive('taskMetricsWidget', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/modules/task/directives/taskMetricsWidget/taskMetricsWidget.html',
            controller: function ($scope) {

                var getMetrics = function (tasks) {

                    $scope.counter = tasks.length;

                    $scope.estimatedTime = 0;
                    $scope.points = 0;
                    $scope.timeToDo = 0;

                    tasks.forEach(function (task) {
                        if (task.simple) {
                            if (task.estimatedTime) {
                                $scope.estimatedTime += task.estimatedTime;
                            }
                            if (task.complexity) {
                                $scope.points += task.points;
                            }
                            if (task.timeToDo) {
                                $scope.timeToDo += task.timeToDo;
                            }
                        }
                    })
                };

                $scope.$watchCollection('tasks', function () {
                    getMetrics($scope.tasks);
                });


            },
            scope: {
                tasks: "=tasks"
            }
        }
    });
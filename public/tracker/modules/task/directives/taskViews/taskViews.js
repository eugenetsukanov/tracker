angular
    .module('Tracker')
    .directive('taskViews', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/modules/task/directives/taskViews/taskViews.html',
            controller: function ($scope, TaskEditorModal, MetricsService
                                  //SortingService
            ) {

                $scope.views = [
                    {title: 'Board', name: 'board'},
                    {title: 'List', name: 'list'},
                    {title: 'Tree', name: 'tree'}
                ];

                $scope.view = $scope.views[0];

                $scope.loadView = function (view) {
                    $scope.view = view;
                };

                $scope.edit = function (task) {
                    TaskEditorModal.show(task, function () {
                        if ($scope.taskOnComplete) {
                            $scope.taskOnComplete();
                        }
                    });
                };

                $scope.metricsDetails = MetricsService.getMetrics();
                //$scope.sortByPriority = SortingService.getSortingOrder();

                $scope.tooltipMetrics = function () {
                    if (MetricsService.getMetrics() == 0) {
                        $scope.tooltip = 'Metrics';
                    } else if (MetricsService.getMetrics() == 1) {
                        $scope.tooltip = 'Full Metrics';
                    } else if (MetricsService.getMetrics() == 2) {
                        $scope.tooltip = 'Hide Metrics';
                    }

                    return $scope.tooltip;
                };

                $scope.tooltipMetrics();

                $scope.toggleMetrics = function () {
                    MetricsService.toggle();
                    $scope.tooltipMetrics();
                    $scope.metricsDetails = MetricsService.getMetrics();
                };

                //$scope.sortByPriority = function () {
                //    if ($scope.sortByPriority == 1) {
                //        $scope.tasks.reverse();
                //    } else {
                //        $scope.tasks.reverse();
                //    }
                //};
                $scope.sortByPriority = function () {
                    $scope.tasks.reverse();
                }

            },
            scope: {
                tasks: "=tasks",
                taskOnComplete: "=taskOnComplete"
            }

        }
    });
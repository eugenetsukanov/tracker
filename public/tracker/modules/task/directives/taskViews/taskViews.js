angular
    .module('Tracker')
    .directive('taskViews', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/modules/task/directives/taskViews/taskViews.html',
            controller: function ($scope, TaskEditorModal, SettingsService) {

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

                $scope.metricsToggle = SettingsService.getMetrics();

                $scope.tooltipMetrics = function(){
                    if (SettingsService.getMetrics() == 0){
                        $scope.tooltip = 'Metrics';
                    } else if (SettingsService.getMetrics() == 1){
                        $scope.tooltip = 'Full Metrics';
                    } else if (SettingsService.getMetrics() == 2) {
                        $scope.tooltip = 'Hide Metrics';
                    }
                    return $scope.tooltip;
                };

                $scope.tooltipMetrics();

                $scope.toggleMetrics = function(){
                    SettingsService.toggleMetrics();
                    $scope.tooltipMetrics();
                    $scope.metricsToggle = SettingsService.getMetrics();
                }

            },
            scope: {
                tasks: "=tasks",
                taskOnComplete: "=taskOnComplete"
            }

        }
    });
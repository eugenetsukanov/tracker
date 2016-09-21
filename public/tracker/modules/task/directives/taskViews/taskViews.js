angular
    .module('Tracker')
    .directive('taskViews', function () {
            return {
                restrict: 'A',
                templateUrl: 'tracker/modules/task/directives/taskViews/taskViews.html',
                controller: function ($scope, TaskEditorModal, MetricsService,
                                      SortingService) {

                    $scope.activeSortPriority = false;

                    var aTasks = [];
                    _.forEach($scope.tasks, function (aTask) {
                        aTasks.push(aTask);
                    });

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
                    $scope.sortByDateOrder = SortingService.getSortingOrder('sortByDate');

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

                    $scope.toggleSortingDate = function () {
                        SortingService.toggle('sortByDate');
                        $scope.sortByDateOrder = SortingService.getSortingOrder('sortByDate');
                    };

                    $scope.sortByPriority = function () {
                        $scope.tasks.reverse();
                        $scope.activeSortPriority = !$scope.activeSortPriority;
                    };

                    $scope.pushTasksToScope = function (tasks) {
                        $scope.tasks.splice(0);
                        _.forEach(tasks, function (task) {
                            $scope.tasks.push(task);
                        })
                    };

                    $scope.sortByDate = function () {

                        if ($scope.sortByDateOrder == 1) {
                            var descTasks = SortingService.sortByOrder($scope.tasks, 'updatedAt', 'desc');
                            $scope.pushTasksToScope(descTasks);
                        } else if ($scope.sortByDateOrder == 2) {
                            var ascTasks = SortingService.sortByOrder($scope.tasks, 'updatedAt', 'asc');
                            $scope.pushTasksToScope(ascTasks);
                        } else {
                            $scope.pushTasksToScope(aTasks);
                        }
                    };

                    $scope.$watchCollection('tasks', function () {
                        if ($scope.sortByDateOrder !== 0) {
                            $scope.sortByDate();
                        }

                        $scope.tasksList = mappingTasks();

                    });

                    $scope.tasksList = [];
                    var statuses = [
                        {name: 'New', status: ''},
                        {name: 'In progress', status: 'in progress'},
                        {name: 'Accepted', status: 'accepted'}];

                    function mappingTasks() {
                        var arr = [];

                        _.forEach(statuses, function (st, i) {
                            var list = {status: st.status, name: st.name, tasks: []};
                            arr.push(list);

                            _.forEach($scope.tasks, function (task) {

                                if (task.status === arr[i].status) {
                                    arr[i].tasks.push(task)
                                }
                            });
                        });;
                        return arr;
                    }
                }
                ,
                scope: {
                    tasks: "=tasks",
                    taskOnComplete: "=taskOnComplete"
                }

            }
        }
    );
angular
    .module('Tracker')
    .directive('taskViews', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/modules/task/directives/taskViews/taskViews.html',
            controller: function ($scope, TaskEditorModal, MetricsService,
                                  SortingService, Task) {

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
                });

                $scope.tasksList = [
                    {"new": []},
                    {"inProgress": []},
                    {"accepted": []}
                ];

                _.forEach($scope.tasks, function (task) {
                    console.log("tasks",$scope.tasks);
                    console.log("task",task);

                    if (task.status === '') {
                        console.log('task1',task);
                        $scope.tasksList[0].new.push(task)
                    }
                    if (task.status === 'in progress') {
                        console.log('task2',task);
                        $scope.tasksList[1].inProgress.push(task)
                    }
                    if (task.status === 'accepted') {
                        console.log('task3 ',task);
                        $scope.tasksList[2].accepted.push(task)
                    }
                });
                console.log($scope.tasksList);


                $scope.dropCallback = function (event, index, item, external, type) {
                    console.log("type", type);
                    if (item.status !== type) {
                        item.status = type;
                        var task = new Task(item);
                        task.$update({taskId:item._id},function (){
                            console.log('task was saved');
                        });
                    }

                    console.log("222222", item);
                    return item;
                };

                $scope.$watch('tasksList', function (tasksList) {
                    $scope.modelAsJson = angular.toJson(tasksList, true);
                }, true);


            },
            scope: {
                tasks: "=tasks",
                taskOnComplete: "=taskOnComplete"
            }

        }
    });
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

                        $scope.tasksList = getTaskLists();
                    });

                    $scope.tasksList = [];
                    var statuses = [
                        {name: 'New', value: ''},
                        {name: 'In progress', value: 'in progress'},
                        {name: 'Accepted', value: 'accepted'}];

                    function getTaskLists() {
                        var taskLists = [];

                        _.each($scope.tasks, function (task) {
                            task.tasks = [];
                        });

                        _.forEach(statuses, function (status) {
                            var list = {status: status.value, name: status.name, tasks: []};

                            list.tasks = _.filter($scope.tasks, function (task) {
                                return task.status === list.status;
                            });

                            taskLists.push(list);
                        });
                        return taskLists;
                    }

                    $scope.treeOptions = {
                        accept: function (sourceNodeScope, destNodesScope) {
                            var task = sourceNodeScope.$modelValue;
                            var destinationTask = getDestinationTask(destNodesScope);

                            if ($scope.view.name === 'board' && !task.simple) {
                                var destinationListForBoard = getDestinationList(destNodesScope);

                                if (destinationListForBoard || destinationTask.status === 'accepted') {
                                    return false;
                                }
                            }
                            if ($scope.view.name === 'list' && !task.simple) {
                                var destinationListForList = getDestinationTasks(destNodesScope);

                                if (( destinationTask && destinationTask.status === 'accepted') || (!destinationTask && destinationListForList)) {
                                    return false;
                                }
                            }

                            return true;
                        },
                        dropped: function (event) {
                            var updatedTask;
                            var task = event.source.nodeScope.$modelValue;
                            var destinationTask = getDestinationTask(event.dest.nodesScope);

                            if (destinationTask) {
                                if (task._id === destinationTask._id) {
                                    return false;
                                }
                                task.parentTaskId = destinationTask._id;
                                delete task.tasks;
                                updateTask(task);

                            }

                            if ($scope.view.name === 'board' || $scope.view.name === 'list') {
                                updatedTask = getNewDataForTask(event, task);
                                updateTask(updatedTask);
                            }
                        }
                    };

                    function getDestinationTask(scope) {
                        return scope.$parent.$parent.task;
                    }

                    function getDestinationTasks(scope) {
                        return scope.$parent.$parent.$parent.tasks;
                    }

                    function getDestinationList(scope) {
                        return scope.$parent.list;
                    }

                    function updateTask(task) {
                        var updatedTask = new Task(task);
                        updatedTask.$update({taskId: updatedTask._id}, function () {
                            return true;
                        });
                    }

                    function getNewDataForTask(event, task) {
                        var newIndex = event.dest.index;
                        var destinations = event.dest.nodesScope.$modelValue;
                        var destinationList = getDestinationList(event.dest.nodesScope);

                        if (destinationList) {
                            task.status = destinationList.status;
                        }

                        task.priority = getNewPriority(newIndex, destinations);
                        delete task.tasks;
                        return task;
                    }

                    function getNewPriority(index, destinationTasks) {
                        var siblingUp = destinationTasks[index - 1];
                        var siblingDown = destinationTasks[index + 1];
                        var siblingUpPriority = siblingUp ? siblingUp.priority : undefined;
                        var siblingDownPriority = siblingDown ? siblingDown.priority : undefined;
                        var oldPriority = destinationTasks[index].priority;

                        return calculationPriority(siblingUpPriority, siblingDownPriority, oldPriority);

                    }

                    function calculationPriority(siblingUpPriority, siblingDownPriority, oldPriority) {

                        if (!siblingUpPriority) {
                            if (!siblingDownPriority) {
                                return oldPriority;
                            }

                            return siblingDownPriority === 10 ? siblingDownPriority : ( siblingDownPriority + 1);
                        }

                        if (!siblingDownPriority) {
                            return siblingUpPriority === 0 ? siblingUpPriority : (siblingUpPriority - 1);
                        }

                        return Math.round((siblingUpPriority + siblingDownPriority) / 2);
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
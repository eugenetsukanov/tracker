angular
    .module('Tracker')

    .directive('dragAndDrop', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/directives/dragAndDrop/dragAndDrop.html',
            controller: function ($scope, Task) {

                $scope.dropCallbackByStatus = function (event, index, item, external, type) {

                    console.log('type', type);

                    if (item.simple !== true) {
                        return false;
                    }

                    if (item.status !== type) {

                        item.status = type;
                        var task = new Task(item);

                        task.$update({taskId: item._id}, function () {
                            console.log('task was saved');
                        });
                        return task
                    }
                    return item;
                };

                function saveChildTask(child, parent) {
                    child.parentTaskId = parent._id;
                    delete child.children;

                    var task = new Task(child);

                        task.$update({taskId: task._id}, function () {
                            updateParentTask(parent)
                        });
                }

                function updateParentTask(parent) {
                    parent.children.splice(0, 1);
                }

                function updateNestedTask() {

                    _.forEach($scope.tasksList, function (o) {
                        var parentTask = _.find(o.tasks, function (task) {
                            return task.children.length > 0
                        });

                        if (parentTask) {
                            saveChildTask(parentTask.children[0], parentTask);
                        }

                    });
                }

                var nestedTask = null;

                $scope.dropCallbackOfTask = function (event, index, item, external, type) {
                    if(item._id === type){
                        return false;
                    }
                    nestedTask = item;
                    return item;
                };


                $scope.$watch('tasksList', function (tasksList) {
                    $scope.modelAsJson = angular.toJson(tasksList, true);
                    if (nestedTask) {
                        updateNestedTask();
                        nestedTask = null;
                    }

                }, true);


            }
        }
    });

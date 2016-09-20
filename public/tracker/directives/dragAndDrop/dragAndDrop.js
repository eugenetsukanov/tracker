angular
    .module('Tracker')

    .directive('dragAndDrop', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/directives/dragAndDrop/dragAndDrop.html',
            controller: function ($scope, Task) {

                $scope.dropCallbackByStatus = function (event, index, item, external, type) {

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

                $scope.dropCallbackOfTask = function (event, index, item, external, type) {

                    if(item._id === type){
                        return false;
                    }

                    item.parentTaskId = type;
                    var task = new Task(item);
                    task.$update({taskId: task._id}, function () {
                    });

                    return item;
                };


                $scope.$watch('tasksList', function (tasksList) {
                    $scope.modelAsJson = angular.toJson(tasksList, true);

                }, true);


            }
        }
    });

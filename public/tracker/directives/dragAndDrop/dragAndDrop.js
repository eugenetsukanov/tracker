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

                        task.$update({taskId: item._id});
                        return task
                    }
                    return item;
                };

                $scope.dropCallbackOfTask = function (event, index, item, external, type) {

                    if(item._id === type){
                        return false;
                    }

                    item.parentTaskId = type;
                    delete item.children;
                    var task = new Task(item);
                    task.$update({taskId: task._id}, function () {
                    });

                    return item;
                };

                 function handleDragEnter(e){
                    console.log('enter',e);
                     event.preventDefault();
                     if ( event.target.className === "dndPlaceholder" ) {
                         console.log('1');
                         event.target.style.background = "purple";
                     }

                }

                function handleDragLeave(e) {
                    console.log('leave');
                    if ( event.target.className === "dndPlaceholder" ) {
                        console.log('2');
                        event.target.style.background = "white";
                    }
                    // this.classList.remove('over');  // this / e.target is previous target element.
                }
                //
                // var tasks = document.querySelectorAll('.task');
                // console.log('tasks',tasks);
                // _.forEach(tasks, function(task) {
                //     // console.log('task', task);
                //     // task.addEventListener('dragstart', handleDragStart, false);
                //     task.addEventListener('dragenter', handleDragEnter, false);
                //     // task.addEventListener('dragover', handleDragOver, false);
                //     task.addEventListener('dragleave', handleDragLeave, false);
                // });

                //
                // $scope.$watch('tasksList', function (tasksList) {
                //     $scope.modelAsJson = angular.toJson(tasksList, true);
                //
                // }, true);

                // document.addEventListener('dragenter', handleDragEnter, false);
                // document.addEventListener('dragleave', handleDragLeave, false);


            }
        }
    });

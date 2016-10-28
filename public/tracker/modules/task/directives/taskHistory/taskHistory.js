angular
    .module('Tracker')

    .directive('taskHistory', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/modules/task/directives/taskHistory/taskHistory.html',
            controller: function ($scope,
                                  Task,
                                  TaskComment) {


                function initComment() {
                    $scope.comment = new TaskComment({
                        text: ''
                    });
                    loadComments();
                }

                $scope.$watch('task', function (task) {
                    if (task) {
                        initComment();
                    }
                });

                $scope.saveComment = function($event){
                    if ($event.keyCode == 13 && $event.shiftKey) {
                        createComment();
                    }
                };

                function createComment() {
                    $scope.comment.$save({taskId: $scope.task._id}, function () {
                        updateCommentCounter();
                        loadComments();
                    });
                }

                function updateCommentCounter() {
                    $scope.task.commentsCounter++;
                    $scope.task.$update({taskId: $scope.task._id});
                }

                function loadComments() {
                    TaskComment.query({taskId: $scope.task._id}, function (comments) {
                        $scope.comments = comments;
                    });
                }
            },
            scope: {
                task: "=task"
            }
        }
    })
;
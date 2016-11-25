angular
    .module('Tracker')

    .directive('taskComment', function () {
            return {
                restrict: 'A',
                templateUrl: 'tracker/modules/task/directives/taskComment/taskComment.html',
                controller: function ($scope,
                                      TaskHistory) {

                    initComment();

                    function initComment() {
                        $scope.comment = new TaskHistory({
                            text: ''
                        });
                    }

                    $scope.saveComment = function ($event) {
                        if ($event.keyCode == 13 && $event.shiftKey) {
                            $scope.createComment();
                        }
                    };

                    $scope.createComment = function (){
                        $scope.comment.$save({taskId: $scope.task._id, nested: 'comments'}, function () {
                            $scope.onCommentSave();
                        });
                    };

                    $scope.onCommentSave = function () {
                        if ($scope.onSave) {
                            $scope.onSave();
                        }
                    };


                },
                scope: {
                    task: "=",
                    onSave:"=onSave"
                }
            }
        }
    )
;
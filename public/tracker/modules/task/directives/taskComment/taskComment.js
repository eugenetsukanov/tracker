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
                            createComment();
                        }
                    };

                    function createComment() {
                        $scope.comment.$save({taskId: $scope.task._id, nested: 'comments'});
                    }

                },
                scope: {
                    task: "="
                }
            }
        }
    )
;
angular
    .module('Tracker')

    .directive('taskHistory', function () {
            return {
                restrict: 'A',
                templateUrl: 'tracker/modules/task/directives/taskHistory/taskHistory.html',
                controller: function ($scope,
                                      TaskHistory,
                                      SocketService) {

                    var allMessages;
                    loadHistory($scope.task._id);

                    $scope.reload = function () {
                        loadHistory($scope.task._id);
                    };

                    SocketService.scopeOn($scope, 'comment.save', function (data) {

                        if ($scope.task && $scope.task._id === data.task) {
                            $scope.reload();
                        }
                    });

                    function loadHistory(taskId) {
                        TaskHistory.query({taskId: taskId}, function (messages) {
                            $scope.messages = messages;
                            allMessages = messages;

                        });
                    }

                    $scope.findComments = function () {
                        $scope.messages = allMessages;
                        $scope.messages = _.filter($scope.messages, {'_type': 'TaskComment'});

                    };

                    $scope.findOtherMessages = function () {
                        $scope.messages = allMessages;
                        $scope.messages = _.filter($scope.messages, function (message) {
                            return message._type !== 'TaskComment';
                        });
                    };

                    $scope.findAllMessages = function () {
                        $scope.messages = allMessages;
                    }
                },
                scope: {
                    task: "="

                }
            }
        }
    )
;
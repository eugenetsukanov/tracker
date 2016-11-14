angular
    .module('Tracker')

    .directive('taskHistory', function () {
            return {
                restrict: 'A',
                templateUrl: 'tracker/modules/task/directives/taskHistory/taskHistory.html',
                controller: function ($scope,
                                      Task,
                                      TaskHistory,
                                      historyInfoService) {
                    var allMessages;

                    $scope.getInclude = function (messageType) {
                        var historyType = _.find(historyInfoService, function (historyType) {
                            return historyType.type === messageType;
                        });
                        return historyType.templateUrl;
                    };

                    function initComment() {
                        $scope.comment = new TaskHistory({
                            text: ''
                        });
                        loadHistory();
                    }

                    $scope.$watch('task', function (task) {
                        if (task) {
                            initComment();
                        }
                    });

                    $scope.saveComment = function ($event) {
                        if ($event.keyCode == 13 && $event.shiftKey) {
                            createComment();
                        }
                    };

                    function createComment() {
                        $scope.comment.$save({taskId: $scope.task._id, nested: 'comments'}, function () {
                            updateCommentCounter();
                            loadHistory();
                        });
                    }

                    function updateCommentCounter() {
                        $scope.task.commentsCounter++;
                        $scope.task.$update({taskId: $scope.task._id});
                    }

                    function loadHistory() {
                        TaskHistory.query({taskId: $scope.task._id}, function (messages) {
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
                    task: "=task"

                }
            }
        }
    )
;
angular
    .module('Tracker')

    .directive('taskTree', function ($compile, Task) {

        return {
            restrict: 'E',
            scope: {
                task: '='
            },
            templateUrl: 'templates/task-tree.html',
            link: function (scope, element) {

                if (!scope.task.simple) {

                    Task.query({taskId: scope.task._id, nested: 'tasks'}, function (tasks) {

                        tasks.forEach(function (task) {

                            var myScope = scope.$root.$new();
                            myScope.task = task;

                            var $el = $compile("<task-tree task='task'></task-tree>")(myScope);
                            element.append($el);

                        });

                    });

                }

            }
        }

    })
;
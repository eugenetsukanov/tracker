angular
    .module('Tracker')

    .directive('taskTree', function ($compile, Task) {

        return {
            restrict: 'E',
            scope: {
                task: '=',
                edit: '=taskOnEdit'
            },
            templateUrl: 'templates/task-tree.html',
            link: function (scope, element) {

                if (!scope.task.simple) {

                    Task.query({taskId: scope.task._id, nested: 'tasks'}, function (tasks) {

                        tasks.forEach(function (task) {

                            var myScope = scope.$root.$new();
                            myScope.task = task;
                            myScope.edit = scope.edit || new Function();

                            var $el = $compile("<task-tree task='task' task-on-edit='edit'></task-tree>")(myScope);
                            element.append($el);

                        });

                    });

                }

            }
        }

    })
;
angular
    .module('Tracker')

    .directive('taskTree', function ($compile, Task) {

        return {
            restrict: 'E',
            scope: {
                task: '=',
                metricsToggle: "=metricsToggle",
                edit: '=taskOnEdit'
            },
            templateUrl: 'tracker/modules/task/directives/taskTree/taskTree.html',
            link: function (scope, element) {

                if (!scope.task.simple) {

                    Task.query({taskId: scope.task._id, nested: 'tasks'}, function (tasks) {

                        tasks.forEach(function (task) {

                            var myScope = scope.$root.$new();
                            myScope.task = task;
                            myScope.edit = scope.edit || null;

                            scope.$watch('metricsToggle', function (toggler) {
                                myScope.metricsToggle = toggler;
                            });

                            var $el = $compile("<task-tree task='task' task-on-edit='edit' metrics-toggle='metricsToggle'></task-tree>")(myScope);
                            element.append($el);

                        });

                    });

                }

            }
        }

    })
;
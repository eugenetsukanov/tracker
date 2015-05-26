angular
    .module('Tracker')

    .directive('taskStatusLabel', function () {
        return {
            restrict: 'C',
            link: function (scope, element, attrs) {
                var getClass = function () {
                    var cl = 'label-info';

                    if (scope.task.status == 'accepted') {
                        cl = 'label-success';
                    }

                    if (scope.task.status == 'in progress') {
                        cl = 'label-warning'
                    }

                    return cl

                };

                attrs.$addClass(getClass());

            }
        }
    });
angular
    .module('Tracker')

    .directive('taskStatus', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                scope.$watch('taskStatus', function (statusNew, statusOld) {
                    attrs.$removeClass(getClass(statusOld));
                    attrs.$addClass(getClass(statusNew));
                });

                var getClass = function (status) {

                    scope.taskStatus = status;

                    var cl = 'label-info';

                    if (scope.taskStatus == 'accepted') {
                        cl = 'label-success';
                    }

                    if (scope.taskStatus == 'in progress') {
                        cl = 'label-warning'
                    }

                    return cl

                };

            },
            scope: {
                taskStatus:'=taskStatus'
            }
        }
    });
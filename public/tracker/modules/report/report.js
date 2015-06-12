angular
    .module('Tracker')

    .factory('ReportByDate', function ($resource) {
        return $resource('/api/tasks/report/:date');
    })
    .factory('ReportByTaskId', function ($resource) {
        return $resource('/api/tasks/:taskId/report/:date', {taskId: '@_id'});
    })

    .controller('ReportCtrl', function ($scope) {

        $scope.date = new Date();

        $scope.openDatePicker = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };
    })
;




angular
    .module('Tracker')

    .factory('ReportByDate', function ($resource) {
        return $resource('/api/report/date/:date');
    })
    .factory('ReportByTaskId', function ($resource) {
        return $resource('/api/report/task/:taskId', {taskId: '@_id'});
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




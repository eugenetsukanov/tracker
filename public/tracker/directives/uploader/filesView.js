angular
    .module('Tracker')

    .directive('filesView', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/directives/uploader/filesView.html',
            controller: function ($scope) {
                $scope.isImage = function (file) {
                    return /\.(jpg|png|gif|jpeg|bmp)$/.test(file);
                };
            },
            scope: {
                files: "=files"
            }
        }
    });
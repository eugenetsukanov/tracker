angular
    .module('Tracker')

    .directive('filesView', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/directives/uploader/filesView.html',
            controller: function ($scope) {
                $scope.isImage = function (file) {
                    return /\.(jpg|jpeg|png|gif|bmp)$/i.test(file);
                };
            },
            scope: {
                files: "=files"
            }
        }
    });
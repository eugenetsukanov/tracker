angular
    .module('Tracker')

    .directive('filesView', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/directives/uploader/filesView.html',
            controller: function ($scope, $stateParams, File) {
                $scope.isImage = function (file) {
                    return /\.(jpg|jpeg|png|gif|bmp)$/i.test(file);
                };

                $scope.deleteFile = function (file) {

                    if( $scope.onDelete) {
                        $scope.onDelete(file);
                    }

                };

            },
            scope: {
                files: "=files",
                onDelete: '='
            }
        }
    });
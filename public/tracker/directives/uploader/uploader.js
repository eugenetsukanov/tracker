angular
    .module('Tracker')

    .directive('uploader', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/directives/uploader/uploader.html',
            controller: function ($scope, Upload, $timeout) {

                var tryToClean = function () {
                    if ($scope.totalProgress == 100) {
                        $timeout(function () {
                            $scope.totalProgress = 0;
                        }, 3000);
                    }
                };

                $scope.upload = function (files) {

                    var filesInProgress = 0;
                    $scope.totalProgress = 0;

                    if (files && files.length) {
                        for (var i = 0; i < files.length; i++) {
                            var file = files[i];
                            Upload.upload({
                                url: '/api/files',
                                file: file
                            }).progress(function (evt) {

                                if (files.length == 1) {
                                    $scope.totalProgress = parseInt(100.0 * evt.loaded / evt.total);
                                }

                                tryToClean();
                            }).success(function (data, status, headers, config) {
                                filesInProgress += 1;
                                $scope.totalProgress = ( filesInProgress / files.length ) * 100;
                                $scope.files.push(data);

                                if ($scope.totalProgress == 100) {
                                    filesInProgress = 0;
                                }

                                tryToClean();
                            });
                        }
                    }
                };
            },
            scope: {
                files: "=files"
            }
        }
    });
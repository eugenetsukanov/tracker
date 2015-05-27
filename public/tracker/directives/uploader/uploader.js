angular
    .module('Tracker')

    .directive('uploader', function () {
        return {
            restrict: 'A',
            templateUrl: 'tracker/directives/uploader/uploader.html',
            controller: function ($scope, Upload, $timeout) {
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
                                //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                            }).success(function (data, status, headers, config) {
                                filesInProgress += 1;
                                $scope.totalProgress = ( filesInProgress / files.length ) * 100;
                                $scope.files.push(data);

                                if ($scope.totalProgress == 100){
                                    $timeout(function(){
                                        filesInProgress = 0;
                                        $scope.totalProgress = 0;
                                    }, 3000);
                                }
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
angular
    .module('Tracker')

    .directive('uploader', function () {
        return {
            restrict: 'A',
            templateUrl: 'js/directives/uploader/views/uploader.html',
            controller: function ($scope, Upload) {
                $scope.upload = function (files) {

                    var filesInProgress = 0;
                    $scope.totalProgress = 0;

                    if (files && files.length) {
                        for (var i = 0; i < files.length; i++) {
                            var file = files[i];
                            Upload.upload({
                                url: '/api/upload',
                                fields: {'username': $scope.username},
                                file: file
                            }).progress(function (evt) {
                                //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                            }).success(function (data, status, headers, config) {
                                filesInProgress += 1;
                                $scope.totalProgress = ( filesInProgress / files.length ) * 100;
                                $scope.newTask.files.push(data);
                            });
                        }
                    }
                };
            },
            scope: {
                newTask: "=files"
            }
        }
    });
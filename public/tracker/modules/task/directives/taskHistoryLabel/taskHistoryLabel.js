angular
    .module('Tracker')

    .directive('taskHistoryLabel', function () {
        return {
            restrict: 'E',
            template: '<span class="label label-default" ng-class="labelType.color">{{labelType.name}}</span>',
            controller: function ($scope, historyInfoService) {

                $scope.labelType = _.find(historyInfoService, function (type) {
                    return type.type === $scope.historytype;
                });
            },
            scope: {
                historytype: '='
            }
        }
    });

angular
    .module('Tracker')
    .directive('historyBack', function ($window) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                if ($window.history.length < 2){
                    element.addClass('ng-hide')
                }
                element.on('click', function() {
                    $window.history.back();
                });
            }
        }
    })
;

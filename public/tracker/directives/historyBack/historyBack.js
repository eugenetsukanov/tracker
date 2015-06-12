angular
    .module('Tracker')
    .directive('historyBack', function ($window) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.on('click', function() {
                    $window.history.back();
                });
            }
        }
    })
;

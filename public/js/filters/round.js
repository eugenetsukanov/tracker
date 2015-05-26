angular
    .module('Tracker')
    .filter('round', function ($filter) { // filter for rounding numbers
        return function (number) {
            return $filter('currency')(number, '');
        };
    })

;

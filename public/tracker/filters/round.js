angular
    .module('Tracker')
    .filter('round', function ($filter) { // filter for rounding numbers
        return function (number) {
            if(!number) return 0;
            return $filter('number')(number, 2);
        };
    })

;

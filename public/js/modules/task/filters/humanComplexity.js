angular
    .module('Tracker')
    .filter('humanComplexity', function (taskComplexity) {

        return function (complexity) {
            var result = '';
            taskComplexity.forEach(function (item) {
                if (item.value == complexity) {
                    result = item.name;
                }
            });
            return result;
        };

    })

;
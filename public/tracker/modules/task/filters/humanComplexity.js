angular
    .module('Tracker')
    .filter('humanComplexity', function (TaskComplexity) {

        return function (complexity) {
            var result = '';
            TaskComplexity.forEach(function (item) {
                if (item.value == complexity) {
                    result = item.name;
                }
            });
            return result;
        };

    })

;
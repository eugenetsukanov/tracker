angular
    .module('Tracker')

    .filter('toDate', function () {
    return function (date, format) {
        var format = format || 'ddd, DD-MM-YYYY';
        return moment(date).format(format);
    }
});

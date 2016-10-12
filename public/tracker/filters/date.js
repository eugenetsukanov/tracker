angular.module('Tracker')
    .filter('fromNow', function () {
        return function (date) {
            return date ? moment(moment.utc(date).toDate()).fromNow(true) : '';
        }
    })
    .filter('moment', function () {
        return function (date, format) {
            return date ? moment(moment.utc(date).toDate()).format(format) : '';
        }
    })
    .filter('momentHumanize', function () {
        return function (duration) {

            var duration = parseInt(duration);

            if (isNaN(duration)) return '';

            if (duration < 60) {
                return duration + ' seconds'
            }
            else {
                return moment.duration(duration, 'seconds').humanize();
            }
        }
    })
    .filter('momentValueToTime', function () {
        return function (duration) {

            if (isNaN(duration)) return '';

            var duration = moment.duration(duration*60, 'm');

            return moment.utc(duration.asMilliseconds()).format('HH:mm');
        }
    })
;

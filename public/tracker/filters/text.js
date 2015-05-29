angular.module('Tracker')

    .filter('text', function ($sce) {
        return function (text) {

            var txt = text
                .replace(/\r\n|\n/g, " <br /> ")
                .replace(/(https?:\/\/[^\s]+)/g, function (url) {
                    return ' <a href="' + url + '" target="_blank">' + url + '</a> ';
                });
            return $sce.trustAsHtml(txt);
        }
    })
;
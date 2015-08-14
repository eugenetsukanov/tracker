module.exports = function (Cron, container) {

    Cron.register('* 0 * * * *', function () {

        var GridFS = container.get('GridFS');
        GridFS.cleanupUnconnected(function (err, status) {
            if (err) console.log(err);
            
            if (status) {
                console.log('All unattached files was deleted');
            } else {
                console.log('No unattached files to delete');
            }
        })
    });

    Cron.register('* 0 * * * *', function () {

        var TaskArchivator = container.get('TaskArchivator');

    });

};
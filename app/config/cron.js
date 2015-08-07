module.exports = function (Cron, container) {

    Cron.register('* */15 * * * *', function () {

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
}
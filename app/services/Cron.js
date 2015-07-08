module.exports = function () {

    var CronJob = require('cron').CronJob;

    this.register = function (shedule, handler) {
        var job = new CronJob({
            cronTime: shedule,
            onTick: handler,
            start: true
        });
    }

};
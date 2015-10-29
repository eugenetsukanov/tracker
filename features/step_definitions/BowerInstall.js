module.exports = function () {

    var fse = require('fs-extra'),
        exec = require('child_process').exec,
        child;

    this.Then(/^I remove bower packages$/, function (callback) {
        fse.remove('./public/lib/', function (err) {
            if (err) return callback(err);

            callback();
        });

    });

    this.Then(/^I install bower packages$/, function (callback) {

        child = exec('bower install',
            function (error) {
                if (error !== null) {
                    callback(error);
                }
                callback();
            }
        );
    });

};
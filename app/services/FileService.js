var FileService = function (GridFS) {
    var _ = require('lodash');


    this.removeFile = function (file, next) {
        next = next || _.noop;
        GridFS.removeFile({_id: file}, next);
    };

    this.connectFiles = function (files, next) {
        next = next || _.noop;

        if (files && files.length) {
            GridFS.connect(files, next);
        } else {
            next();
        }
    };

    this.removeFiles = function (files, next) {
        next = next || _.noop;
        if (files) {
            GridFS.remove(files, next);
        } else {
            next();
        }
    };
};

module.exports = FileService;
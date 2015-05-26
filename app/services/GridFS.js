var GridFS = function (uri) {

    var Grid = require('gridfs-stream');
    var mongoose = require('mongoose');

    var self = this;

    this.gfs = null;


    Grid.mongo = mongoose.mongo;

    var conn = mongoose.createConnection(uri);

    conn.once('open', function () {
        this.gfs = Grid(conn.db);
    }.bind(this));

    this.getFs = function () {
        return this.gfs;
    }

    this.hasFs = function () {
        return !!this.gfs;
    }

    this.getWriteStream = function (options) {
        return this.getFs().createWriteStream(options);
    }

    this.getFile = function (fileName, next) {
        this.findFile({filename: fileName}, next);
    }

    this.getFileWithStream = function (fileName, next) {

        this.getFile(fileName, function (err, file) {

            if (err) return next(err);
            if (!file) return next();


            file.stream = self.getReadStreamForFile(file);
            next(null, file);
        });

    }

    this.findFile = function (options, next) {
        this.getFs().files.findOne(options, next);
    }

    this.getReadStream = function (options) {
        return this.getFs().createReadStream(options);
    }

    this.getReadStreamForFile = function (file) {
        return this.getReadStream({_id: file._id});
    }
};

module.exports = GridFS;
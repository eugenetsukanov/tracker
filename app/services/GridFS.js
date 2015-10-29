var GridFS = function (uri) {

    var Grid = require('gridfs-stream');
    var mongoose = require('mongoose');
    var fs = require('fs-extra');
    var _ = require('lodash');
    var async = require('async');

    var self = this;

    this.gfs = null;
    Grid.mongo = mongoose.mongo;

    var connection = mongoose.createConnection(uri);

    connection.once('open', function () {
        this.gfs = Grid(connection.db);
    }.bind(this));

    this.getFs = function () {
        return this.gfs;
    };

    this.getWriteStream = function (options) {
        return this.getFs().createWriteStream(options);
    };

    this.getFile = function (fileName, next) {
        this.findFile({filename: fileName}, next);
    };

    this.getFileWithReadStream = function (fileName, next) {

        this.getFile(fileName, function (err, file) {

            if (err) return next(err);
            if (!file) return next();

            file.stream = self.getReadStreamForFile(file);
            next(null, file);
        });

    };

    this.findFile = function (options, next) {
        this.getFs().files.findOne(options, next);
    };

    this.getReadStream = function (options) {
        return this.getFs().createReadStream(options);
    };

    this.getReadStreamForFile = function (file) {
        return this.getReadStream({_id: file._id});
    };

    this.save = function (filePath, options, next) {


        fs.exists(filePath, function (exists) {

            var cleanup = function () {
                fs.remove(filePath, new Function);
            };

            if (!exists) return next(new Error('File is not exists: ' + filePath));

            var writeStream = self.getWriteStream(options);
            var readStream = fs.createReadStream(filePath);

            readStream.pipe(writeStream);

            readStream.on('error', function (err) {
                cleanup();
                next(err);
            });

            writeStream.on('close', function (file) {
                cleanup();
                next(null, file);
            });

        });

    };

    this.remove = function (file, next) {
        if (_.isArray(file)) {
            async.each(file, function (file, next) {
                self.removeFile(file, next);
            }, next)
        } else {
            this.removeFile(file, next);
        }
    };

    this.removeFile = function (file, next) {

        var options = {};

        if (_.isObject(file)) {
            options._id = file._id || undefined;
            options.filename = file.filename || undefined;
        } else {
            options.filename = file;
        }

        this.getFs().remove(options, function (err) {
            if (err) return next(err);
            next();
        });

    };

    this.connect = function (file, next) {
        if (_.isArray(file)) {
            async.each(file, function (file, next) {
                self.connectFile(file, next);
            }, next)
        } else {
            this.connectFile(file, next);
        }
    };

    this.connectFile = function (file, next) {
        var File = connection.db.collection('fs.files');

        var id = _.isObject(file) ? file._id : file;

        File.update(
            {
                _id: id,
                'metadata.connected': {$exists: false}
            },
            {
                $set: {'metadata.connected': true}
            },
            function (err, result) {
                if (err) return next(err);
                next();
            });
    };

    this.cleanupUnconnected = function (next) {

        var File = connection.db.collection('fs.files');

        File.find(
        {
            'metadata.connected': {$ne: true}
        }).toArray(
        function (err, result) {
            async.each(result, function (item, next) {
                self.removeFile({_id: item._id}, next);
            }, function () {
                if (err) return next(err);
                next(null, result.length);
            });
        });
    }
};

module.exports = GridFS;
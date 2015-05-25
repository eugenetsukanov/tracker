var GridFS = function (uri) {

    var Grid = require('gridfs-stream');
    var mongoose = require('mongoose');

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
};

module.exports = GridFS;
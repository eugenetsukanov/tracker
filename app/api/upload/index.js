module.exports = function (app) {

    var GridFS = app.container.get('GridFS');
    var multer  = require('multer');
    app.use('/api/upload', multer({ dest: './public/uploads/'}));

    app.post('/api/upload', function (req, res) {

        var fs = require('fs-extra');
        var file = req.files.file;

        var writeStream = GridFS.getWriteStream({
            filename: file.name,
            metadata: file
        });

        var readStream = fs.createReadStream(file.path);
        readStream.pipe(writeStream);

        readStream.on('error', function (err) {
            throw err;
        });

        writeStream.on('close', function (file) {
            //console.log(file);
            res.send(file.filename);
        });
    });

    app.get('/api/files/:file', function (req, res, next) {

        var file = req.params.file;

        GridFS.getFs().files.findOne({ filename: file }, function (err, file) {
            if (err) return next(err);
            if(!file) return res.sendStatus(404);

            res.header("Content-Type", file.metadata.mimetype);

            var readstream = GridFS.getFs().createReadStream({
                _id: file._id
            });

            readstream.pipe(res);
        });

    });

};
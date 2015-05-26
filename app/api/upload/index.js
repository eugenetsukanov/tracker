module.exports = function (app) {

    var GridFS = app.container.get('GridFS');
    var multer = require('multer');
    app.use('/api/upload', multer({dest: './public/uploads/'}));

    app.post('/api/upload', function (req, res) {

        var file = req.files.file;

        var fs = require('fs-extra');

        var writeStream = GridFS.getWriteStream({
            filename: file.name,
            content_type: file.mimetype,
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

        GridFS.getFileWithStream(req.params.file, function (err, file) {

            if (err) return next(err);
            if (!file) return res.sendStatus(404);

            res.header("Content-Type", file.content_type);
            file.stream.pipe(res);
        });

    });

};
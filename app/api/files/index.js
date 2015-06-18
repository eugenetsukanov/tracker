module.exports = function (app) {

    var GridFS = app.container.get('GridFS');
    var multer = require('multer');

    app.use('/api/files', multer({dest: './public/uploads/', limits: {
        fieldSize: 1024*1024*1024
    }}));

    app.post('/api/files', function (req, res, next) {

        var file = req.files.file;

        GridFS.save(file.path, {
            filename: file.name,
            content_type: file.mimetype,
            metadata: {
                originalname: file.originalname
            }
        }, function (err, file) {
            if (err) return next(err);
            res.json(file);
        });

    });

    app.get('/api/files/:file', function (req, res, next) {

        GridFS.getFileWithReadStream(req.params.file, function (err, file) {

            if (err) return next(err);
            if (!file) return res.sendStatus(404);

            res.header("Content-Type", file.content_type);
            file.stream.pipe(res);
        });

    });

};
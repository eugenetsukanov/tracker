module.exports = function (app) {

    var multer  = require('multer');
    app.use('/api/upload', multer({ dest: './public/uploads/'}));

    app.post('/api/upload', function (req, res) {
        var fileName = req.files.file.name;
        res.send(fileName);
    });

};
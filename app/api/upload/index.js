module.exports = function (app) {

    var multer  = require('multer');
    app.use('/api/upload', multer({ dest: './public/uploads/'}));

    app.post('/api/upload', function (req, res) {
        console.log(req.files.file);
        var fileName = req.files.file.name;
        res.send(fileName);
    });

};
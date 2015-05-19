module.exports = function (app) {

    var multer  = require('multer');
    app.use('/api/upload', multer({ dest: './public/uploads/'}));

    app.post('/api/upload', function (req, res) {
        var file = req.files.file.name;
        console.log(req.files.file.path);
        res.send(file);
    })

};
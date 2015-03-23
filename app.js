var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/tracker');

var Schema = mongoose.Schema;

var Task = new Schema({
    title:  String,
    user: String,
    priority: Number,
    status: String,
    spendtime: Number,
    velocity: Number,
    date: { type: Date, default: Date.now }
});


var server = app.listen(3000, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port)

});
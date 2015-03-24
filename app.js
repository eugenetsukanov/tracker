var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var passport = require('passport');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/tracker');


app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'tracker$app' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));



// passport
require('./app/config/passport')(passport);

// app routes
require('./app/routes/app.routes')(app, passport);

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Tracker app listening at http://%s:%s', host, port)
});
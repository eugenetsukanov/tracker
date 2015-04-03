var express = require('express');

var app = express();
app.application = require('./app/config/application');
app.config = app.application.config;

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var passport = require('passport');

var mongoose = require('mongoose');
mongoose.connect(app.config.get('mongo:uri'));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var MongoSessionStore = require('connect-mongo')(session);

app.use(session({
    secret: app.config.get('session:secret'),
    resave: true,
    saveUninitialized: true,
    store: new MongoSessionStore({ url: app.config.get('mongo:uri') })
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));


// passport
require('./app/config/passport')(passport);

// app routes
require('./app/routes/app.routes')(app, passport);

if (app.config.get('fixtures:load')) {
    console.log('> load fixtures');

    var fixtures = require('pow-mongodb-fixtures').connect(app.config.get('mongo:uri'));
    fixtures.clearAndLoad(__dirname + '/app/config/fixtures', function (err) {
        if (err) console.error(err);
    });
}

var server = app.listen(app.config.get('app:port'), function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Tracker app listening at http://%s:%s', host, port)
});
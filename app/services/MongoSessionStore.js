var MongoSessionStore = function (mongoUrl) {

    var session = require('express-session');
    var MongoSessionStore = require('connect-mongo')(session);

    return new MongoSessionStore({url: mongoUrl});
};

module.exports = MongoSessionStore;
'use strict';

var SocketService = function (MongoSessionStore, secret) {
    var cookieParser = require('cookie-parser');
    var passportSocketIo = require('passport.socketio');
    var passport = require('passport');

    var self = this;

    self.io = null;

    this.create = function (server) {
        self.io = require('socket.io')(server);

        setup();

        self.io.on('connection', function (socket) {
            if (socket.user) {
                socket.join('user.' + socket.user._id);
            }

            socket.on('disconnect', function () {
                if (socket.user) {
                    socket.disconnect();
                }
            });
        });
    };

    this.emitUser = function (user, event, data) {
        user = user._id || user;
        self.io.to('user.' + user).emit(event, data || {});
    };

    this.emit = function (event, data) {
        self.io.emit(event, data || {});
    };

    function setup() {
        // auth
        self.io.use(passportSocketIo.authorize({
            cookieParser: cookieParser,
            passport: passport,
            secret: secret,
            store: MongoSessionStore
        }));
    }

};

module.exports = SocketService;

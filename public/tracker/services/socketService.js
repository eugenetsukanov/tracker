angular
    .module('SocketService', [])
    .factory('SocketService', ['$location', '$timeout', function ($location, $timeout) {
        var uri = $location.protocol() + '://' + $location.host() + ':' + $location.port();

        var socket = null;
        var self = {};

        var events = {};
        var scopeEvents = {};

        self.off = function (event) {
            events[event] && delete events[event];
            socket.off(event);
        };

        self.offAll = function () {
            _.each(events, function (subscribers, event) {
                socket && socket.off(event);
            });
        };

        self.on = function (event, subscriber) {
            events[event] = events[event] || [];
            events[event] = _.union(events[event], [subscriber]);

            socket.on(event, function () {
                var args = arguments;
                $timeout(function () {
                    subscriber.apply(null, args);
                }, 0);
            });
        };

        self.scopeOn = function (scope, event, subscriber) {
            self.on(event, subscriber);

            var scopeId = scope.$id;
            scopeEvents[scopeId] = scopeEvents[scopeId] || [];

            scopeEvents[scopeId].push({
                scopeId: scopeId,
                event: event,
                subscriber: subscriber
            });

            scope.$on('$destroy', function () {
                var subscribers = scopeEvents[scopeId] || [];

                _.each(subscribers, function (subscriber) {
                    var event = subscriber.event;
                    events[event] = events[event] || [];
                    events[event] = _.filter(events[event], function (eventSubscriber) {
                        return eventSubscriber !== subscriber.subscriber;
                    });
                });

                scopeEvents[scopeId] && delete scopeEvents[scopeId];

                self.offAll();
                self.reSubscribe();
            });
        };

        self.reSubscribe = function () {
            _.each(events, function (subscribers, event) {
                _.each(subscribers, function (subscriber) {
                    self.on(event, subscriber);
                });
            });
        };

        self.connect = function () {
            //console.log('connect');

            self.offAll();
            socket = io.connect(uri, {forceNew: true});
            self.reSubscribe();
        };

        var reconnect = _.throttle(function () {
            //console.log('reconnect');

            socket.close();
            socket.io.disconnect();
            socket.disconnect();

            self.connect();
        }, 100);

        self.reconnect = function () {
            reconnect();
        };

        self.connect();

        return self;
    }]);

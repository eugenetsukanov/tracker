angular
    .module('Tracker')

    .factory('User', function ($resource) {
        return $resource('/api/users/:nested');
    })

    .factory('UserService', function ($q, User, Logout) {
        var self = {

            user: null,

            getUser: function () {
                return this.user
            },
            getUsers: function () {
                return User.query();
            },
            load: function () {
                return $q(function (resolve, reject) {
                    self.user = User.get({nested: 'me'}, function () {
                        resolve(self.user);
                    }, function (err) {
                        reject(err);
                    });
                });
            },
            logout: function () {
                return $q(function (resolve, reject) {
                    Logout.save(function () {
                        self.user = null;
                        resolve();
                    }, reject);
                });

            }
        };


        self.load();

        return self;
    })

    .factory('Login', function ($resource) {
        return $resource('/api/login');
    })
    .controller('LoginCtrl', function ($scope, Login, $state, UserService) {

        $scope.login = function () {

            Login.save({
                username: $scope.userName,
                password: $scope.userPassword
            }, function () {
                UserService.load().then(function () {
                    $state.go('app.tasks');
                });

            })

        }

    })

    .factory('Logout', function ($resource) {
        return $resource('/api/logout');
    })

    .controller('LogoutCtrl', function ($scope, Logout, $state, UserService) {
        UserService.logout().then(function () {
            $state.go('app.login');
        });
    })

    .factory('Register', function ($resource) {
        return $resource('/api/register');
    })

    .controller('RegisterCtrl', function ($scope, Register, $state, UserService) {

        $scope.register = function () {
            Register.save({
                username: $scope.userName,
                password: $scope.userPassword
            }, function () {
                UserService.load().then(function () {
                    $state.go('app.tasks');
                });
            });
        }

    })

    .controller('ProfileCtrl', function ($scope, $state, UserService) {

        $scope.user = UserService.getUser();

        $scope.save = function () {

        };

        $scope.passwordChange = function () {

        };


    });
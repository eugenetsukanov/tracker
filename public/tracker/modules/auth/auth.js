angular
    .module('Tracker')

    .factory('User', function ($resource) {
        return $resource('/api/users/:nested');
    })

    .factory('UserService', function ($q, User) {
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
            }
        };


        self.load();

        return self
    })

    .factory('Login', function ($resource) {
        return $resource('/api/login');
    })
    .controller('LoginCtrl', function ($scope, Login, $state) {

        $scope.login = function () {

            Login.save({
                username: $scope.userName,
                password: $scope.userPassword
            }, function () {
                $state.go('app.tasks');
            })

        }

    })

    .factory('Logout', function ($resource) {
        return $resource('/api/logout');
    })

    .controller('LogoutCtrl', function ($scope, Logout, $state) {
        Logout.save(function () {
            $state.go('app.login');
        });
    })

    .factory('Register', function ($resource) {
        return $resource('/api/register');
    })

    .controller('RegisterCtrl', function ($scope, Register, $state) {

        $scope.register = function () {

            Register.save({
                username: $scope.userName,
                password: $scope.userPassword
            }, function () {
                $state.go('app.tasks');
            })

        }

    });
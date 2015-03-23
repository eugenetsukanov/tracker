angular
    .module('Tracker', ['ui.router', 'ngResource'])


    .config(function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise("/app/tasks");

        $stateProvider

            .state('app', {
                url: "/app",
                views: {
                    "": {
                        templateUrl: "templates/app.html"
                    },
                    menu: {
                        templateUrl: "templates/menu.html"
                    }
                }
            })
            .state('app.tasks', {
                url: "/tasks",
                templateUrl: "templates/tasks.html",
                controller: 'TaskListCtrl'
            })
            .state('app.login', {
                url: "/login",
                controller: "LoginCtrl",
                templateUrl: "templates/login.html"
            })
        ;

    })

    .factory('Task', function ($resource) {
        return $resource('/api/tasks/:taskId', {taskId: '@_id'}, {update: {method: 'PUT'}});
    })
    .controller('TaskListCtrl', function ($scope, Task) {

        function init() {
            $scope.tasks = Task.query();
            $scope.task = new Task();
        }

        init();

        $scope.save = function () {

            if (!$scope.task._id) {
                $scope.task.$save().then(init);
            }

            else {
                $scope.task.$update().then(init);
            }

        };

        $scope.delete = function (task) {
            task.$delete().then(function () {
                $scope.tasks = Task.query();
            });
        };

        $scope.edit = function (task) {
            $scope.task = task;

        }

    })
    .controller('LoginCtrl', function ($scope) {
        
        $scope.login = function () {
            
        }
        
    })


;



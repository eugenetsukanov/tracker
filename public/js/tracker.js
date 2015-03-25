angular
    .module('Tracker', ['ui.router', 'ngResource'])


    .config(function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise("/app/tasks");

        $stateProvider
            .state('app', {
                url: "/app",
                templateUrl: "templates/app.html"
            })
            .state('app.tasks', {
                url: "/tasks",
                templateUrl: "templates/tasks.html",
                controller: 'TaskListCtrl'
            })
            .state('app.task', {
                url: "/tasks/:taskId",
                templateUrl: "templates/task.html",
                controller: 'TaskCtrl'
            })
            .state('app.login', {
                url: "/login",
                controller: "LoginCtrl",
                templateUrl: "templates/login.html"
            })
        ;

    })

    .factory('Task', function ($resource) {
        return $resource('/api/tasks/:taskId/:nested', {taskId: '@_id'}, {update: {method: 'PUT'}});
    })
    .factory('ChildTask', function ($resource) {
        return $resource('/api/tasks/:taskId/childTask', {taskId: '@_id'}, {update: {method: 'PUT'}});
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
    .controller('TaskCtrl', function ($scope, Task, ChildTask, $stateParams) {
        var init = function () {
            $scope.task = Task.get({taskId: $stateParams.taskId});
            $scope.tasks = Task.query({taskId: $stateParams.taskId, nested: 'tasks'});
            $scope.newTask = new Task();
        };

        init();

        $scope.save = function () {

            if (!$scope.newTask._id) {
                $scope.newTask.$save({taskId: $scope.task._id, nested: 'tasks'}).then(init);
            }

            else {
                $scope.newTask.$update().then(init);
            }

        };

        $scope.edit = function (task) {
            $scope.newTask = task;
        };

        $scope.delete = function (task) {
            task.$delete().then(function () {
                init()
            });
        };

    })

    .factory('Login', function ($resource) {
        return $resource('/api/login');
    })
    .controller('LoginCtrl', function ($scope, Login) {

        $scope.login = function () {

            Login.save({
                username: $scope.userName,
                password: $scope.userPassword
            });

        }

    })


;



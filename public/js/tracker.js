angular
    .module('Tracker', ['ui.router', 'ngResource'])


    .config(function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('app', {
                url: "/",
                templateUrl: "templates/tasks.html",
                controller: 'TaskListCtrl'
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


;



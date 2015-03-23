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
            $scope.task.$save().then(init);
        }

    })


;



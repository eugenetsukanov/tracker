angular
    .module('Tracker', ['ui.router'])


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

    .controller('TaskListCtrl', function ($scope) {
        $scope.hi = 1111;
})


;



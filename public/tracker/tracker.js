angular
    .module('Tracker', ['ui.router', 'ngResource', 'ui.bootstrap', 'ngFileUpload', 'monospaced.elastic', 'ui.select', 'ngSanitize'])

    .config(function ($stateProvider, $urlRouterProvider, $httpProvider) {

        $httpProvider.interceptors.push('HttpInterceptor');

        $urlRouterProvider.otherwise("/app/tasks");

        $stateProvider
            .state('app', {
                url: "/app",
                templateUrl: "tracker/tracker.html",
                controller: function ($scope, UserService, SearchService) {

                    $scope.SearchService = SearchService;

                    $scope.UserService = UserService;

                    $scope.$watch('UserService.user._id', function (id) {
                        if (id) {
                            $scope.user = UserService.getUser();
                        } else {
                            $scope.user = null;
                        }
                    });
                }
            })
            .state('app.tasks', {
                url: "/tasks",
                templateUrl: "tracker/modules/task/views/task.html",
                controller: 'TaskCtrl'
            })
            .state('app.task', {
                url: "/tasks/:taskId",
                templateUrl: "tracker/modules/task/views/task.html",
                controller: 'TaskCtrl'
            })
            .state('app.task-search', {
                url: "/tasks/:taskId/search/:query",
                templateUrl: "tracker/modules/task/views/task-search.html",
                controller: 'SearchCtrl'
            })
            .state('app.login', {
                url: "/login",
                controller: "LoginCtrl",
                templateUrl: "tracker/modules/auth/views/login.html"
            })
            .state('app.register', {
                url: "/register",
                controller: "RegisterCtrl",
                templateUrl: "tracker/modules/auth/views/register.html"
            })
            .state('app.logout', {
                url: "/logout",
                controller: "LogoutCtrl"
            })
            .state('app.report', {
                url: "/report",
                controller: "ReportCtrl",
                templateUrl: "tracker/modules/report/report.html"
            })
            .state('app.task-report', {
                url: "/tasks/:taskId/report",
                controller: "ReportCtrl",
                templateUrl: "tracker/modules/task/views/view/task-view-report.html"
            })
            .state('app.assigned-tasks', {
                url: "/users/:userId/tasks",
                controller: "AssignedTasksCtrl",
                templateUrl: "tracker/modules/task/views/view/task-view-assigned.html"
            })
            .state('app.tags-find', {
                url: "/tasks/:taskId/tags/:tags",
                controller: "tagsFindCtrl",
                templateUrl: "tracker/modules/task/views/view/task-view-tags.html"
            })
        ;

    })

    .factory('HttpInterceptor', function ($q, $injector) {
        return {
            'responseError': function (rejection) {
                if (rejection.status == 401) {
                    $injector.get('$state').go('app.login')
                }
                return $q.reject(rejection);
            }
        };
    })

;



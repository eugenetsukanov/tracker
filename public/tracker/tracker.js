angular
    .module('Tracker', ['ui.router', 'toaster', 'ngAnimate', 'ngResource', 'ui.bootstrap',
        'ngFileUpload', 'monospaced.elastic', 'ui.select', 'ngSanitize', 'ngStorage', 'angular-loading-bar', 'ui.tree'])

    .config(function ($stateProvider, $urlRouterProvider, $httpProvider, cfpLoadingBarProvider) {

        $httpProvider.interceptors.push('HttpInterceptor');

        cfpLoadingBarProvider.includeSpinner = false;
        cfpLoadingBarProvider.includeBar = true;

        $urlRouterProvider.otherwise("/app/tasks");

        $stateProvider
            .state('app', {
                url: "/app",
                templateUrl: "tracker/tracker.html",
                controller: function ($scope, $rootScope, UserService, SearchService, toasterConfig, TitleService) {

                    toasterConfig['prevent-duplicates'] = true;

                    $scope.SearchService = SearchService;

                    $scope.UserService = UserService;

                    $scope.$watch('UserService.user._id', function (id) {
                        if (id) {
                            $scope.user = $scope.user || UserService.getUser();
                        } else {
                            $scope.user = null;
                        }
                    });

                    $rootScope.TitleService = TitleService;
                    TitleService.observe();
                }
            })
            .state('app.tasks', {
                url: "/tasks",
                templateUrl: "tracker/modules/task/views/task.html",
                controller: 'TaskCtrl'
            })
            .state('app.projects-archive', {
                url: "/tasks/archived",
                controller: "TaskArchiveCtrl",
                templateUrl: "tracker/modules/task/views/view/task-view-archive.html"
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
                url: "/tasks/:taskId/report/:userId",
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
            .state('app.tags-page', {
                url: "/tasks/:taskId/tags",
                controller: "tagsFindCtrl",
                templateUrl: "tracker/modules/task/views/view/task-view-tags.html"
            })
            .state('app.tasks-archive', {
                url: "/tasks/:taskId/archive",
                controller: "TaskArchiveCtrl",
                templateUrl: "tracker/modules/task/views/view/task-view-archive.html"
            })
            .state('app.profile', {
                url: "/users/me",
                controller: "ProfileCtrl",
                templateUrl: "tracker/modules/auth/views/profile.html"
            })
            .state('app.reset-password', {
                url: "/reset-password",
                controller: "resetPasswordCtrl",
                templateUrl: "tracker/modules/auth/views/reset-password.html"
            })
            .state('public', {
                url: "/public",
                templateUrl: "tracker/tracker.html"
            })
            .state('public.change-password', {
                url: "/change-password/:token",
                controller: "resetPasswordCtrl",
                templateUrl: "tracker/modules/auth/views/change-password.html"
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



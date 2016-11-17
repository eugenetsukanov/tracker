angular
    .module('Tracker')

    .factory('Task', function ($resource) {
        return $resource('/api/tasks/:taskId/:nested', {taskId: '@_id'}, {update: {method: 'PUT'}});
    })

    .factory('TaskMetrics', function ($resource) {
        return $resource('/api/tasks/:taskId/metrics', {taskId: '@_id'});
    })

    .factory('ArchivedProjects', function ($resource) {
        return $resource('/api/tasks/archived');
    })

    .factory('TagsList', function ($resource) {
        return $resource('/api/tasks/:taskId/tags/tagsList', {taskId: '@_id'}, {update: {method: 'PUT'}});
    })

    .factory('TagsFind', function ($resource) {
        return $resource('/api/tasks/:taskId/tags', {taskId: '@_id'}, {update: {method: 'PUT'}});
    })

    .factory('Team', function ($resource) {
        return $resource('/api/tasks/:taskId/team', {taskId: '@_id'});
    })

    .factory('RootTask', function ($resource) {
        return $resource('/api/tasks/:taskId/root', {taskId: '@_id'});
    })

    .factory('TaskMove', function ($resource) {
        return $resource('/api/tasks/:taskId/move/:parentTaskId', {}, {update: {method: 'PUT'}});
    })

    .factory('AssignedTasks', function ($resource) {
        return $resource('/api/users/:userId/tasks', {userId: '@_id'}, {update: {method: 'PUT'}});
    })

    .factory('TaskFile', function ($resource) {
        return $resource('/api/tasks/:taskId/files/:fileId', {fileId: '@_id'}, {update: {method: 'PUT'}});
    })

    .factory('SettingsService', function ($localStorage) {

        var defaultValues = {
            metricsDetails: 0,
            sortByDate: 0
        };

        return {
            getProperty: function (name) {
                return $localStorage[name] || defaultValues[name];
            },
            setProperty: function (name, value) {
                if ($localStorage) {
                    $localStorage[name] = value;
                } else {
                    defaultValues[name] = value;
                }
            }

        }
    })

    .factory('MetricsService', function (SettingsService) {
        return {

            getMetrics: function () {
                return SettingsService.getProperty('metricsDetails');
            },

            toggle: function () {

                var metricsDetails = SettingsService.getProperty('metricsDetails');

                if (metricsDetails < 2) {
                    metricsDetails += 1;
                } else {
                    metricsDetails = 0;
                }

                SettingsService.setProperty('metricsDetails', metricsDetails);

            }
        }
    })

    .factory('SortingService', function (SettingsService) {
        return {

            getSortingOrder: function (sortBy) {
                return SettingsService.getProperty(sortBy);
            },

            toggle: function (sortBy) {

                var sortByValue = SettingsService.getProperty(sortBy);

                if (sortByValue < 2) {
                    sortByValue += 1;
                } else {
                    sortByValue = 0;
                }

                SettingsService.setProperty(sortBy, sortByValue);
            },
            sortByOrder: function (items, fields, orders) {
                if (!_.isArray(orders)) {
                    orders = [orders];
                }

                if (!_.isArray(fields)) {
                    fields = [fields];
                }

                return _.sortByOrder(items, fields, orders);
            }
        }
    })

    .factory('SearchService', function ($q, Task, $stateParams) {

        var self = {

            taskId: '',

            getTaskId: function () {
                self.taskId = $stateParams.taskId;
                return self.taskId;
            },

            search: function (query) {
                return $q(function (resolve, reject) {
                    Task.query({
                        taskId: self.getTaskId(),
                        nested: 'search',
                        query: query
                    }, resolve, reject);
                });
            }
        };

        return self;
    })

    .factory('TaskEditorModal', function ($uibModal) {

        var box = {
            modal: null,
            show: function (task, init) {
                this.modal = $uibModal.open({
                    size: 'lg',
                    templateUrl: 'tracker/modules/task/views/task-edit-modal.html',
                    controller: function ($scope) {

                        $scope.task = task;

                        $scope.done = function () {
                            box.close();
                        }
                    }
                });
                this.modal.result.then(init, init);
            },
            close: function () {
                this.modal.close();
            }
        };

        return box;
    })

    .factory('TitleSettings', function () {

        var self = {

            'app.tasks': {
                title: 'Projects'
            },
            'app.report': {
                title: 'Report'
            },
            'app.assigned-tasks': {
                title: 'My Tasks'
            },
            'app.tags-find': {
                title: 'Search by tags'
            },
            'app.task-search': {
                title: 'Search'
            },
            'app.projects-archive': {
                title: 'Archived Projects'
            },
            'app.profile': {
                title: 'Profile'
            },
            'app.login': {
                title: 'Login to your Tracker'
            },
            'app.register': {
                title: 'Register'
            },
            'app.reset-password': {
                title: 'Reset Password'
            },
            'public.change-password': {
                title: 'Change Password'
            }

        };

        return self;
    })

    .factory('TitleService', function (TitleSettings, $state, $rootScope) {

        var self = {

            getRouteTitle: function () {
                return TitleSettings[$state.current.name]
            },

            setTitle: function (title, prefix) {
                this.title = title;
                self.setPrefix(prefix);
            },

            getTitle: function () {
                return (self.prefix) ? self.prefix + ' | ' + self.title : self.title;
            },

            observe: function () {
                $rootScope.$on('$viewContentLoaded', function () {
                    if (self.getRouteTitle()) {
                        var route = self.getRouteTitle();
                        self.setTitle(route.title, route.prefix);
                    } else {
                        self.setTitle('Tracker');
                    }
                });
            },
            setPrefix: function (prefix) {
                this.prefix = prefix;
            }
        };

        return self;
    })

    .factory('TaskComplexity', function () {
        return complexities = [
            {
                name: '0',
                value: 0
            },
            {
                name: '0+',
                value: 1
            },
            {
                name: '1',
                value: 2
            },
            {
                name: '1+',
                value: 3
            },
            {
                name: '2',
                value: 4
            },
            {
                name: '2+',
                value: 5
            },
            {
                name: '3',
                value: 6
            },
            {
                name: '3+',
                value: 7
            },
            {
                name: '4',
                value: 8
            },
            {
                name: '4+',
                value: 9
            },
            {
                name: '5',
                value: 10
            },
            {
                name: '5+',
                value: 11
            }
        ]
    })

;
angular
    .module('Tracker')

    .factory('Task', function ($resource) {
        return $resource('/api/tasks/:taskId/:nested', {taskId: '@_id'}, {update: {method: 'PUT'}});
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
            metricsDetails: 0
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

    .factory('TaskEditorModal', function ($modal) {

        var box = {
            modal: null,
            show: function (task, init) {
                this.modal = $modal.open({
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

    .factory('TitleService', function ($rootScope, Task, RootTask, $state, User, $stateParams) {

        var self = {
            setTitle: function () {

                $rootScope.$on('$viewContentLoaded', function (event) {

                    if ($state.is('app.tasks')) {
                        $rootScope.trackerTitle = 'Projects';

                    }
                    else if ($state.is('app.task')) {

                        Task.get({taskId: $stateParams.taskId}, function (task) {
                            if (task) {
                                RootTask.get({taskId: task._id}, function (root) {
                                    if (task._id == root._id) {
                                        $rootScope.trackerTitle = root.title;
                                    } else {
                                        $rootScope.trackerTitle = root.title + ' | ' + task.title;
                                    }
                                });
                            }
                        });
                    }
                    else if ($state.is('app.report')) {
                        $rootScope.trackerTitle = 'Report';
                    }
                    else if ($state.is('app.task-report')) {

                        $rootScope.developer = '';

                        var developer = $stateParams.userId;
                        var reportFor = 'All';

                        $rootScope.$watch('developer', function (dev) {
                            if (dev) {
                                developer = dev;

                                User.get({nested: developer}, function (user) {
                                    if (user) {
                                        reportFor = user.name;
                                    }
                                });

                            } else {
                                reportFor = 'All';
                            }

                            Task.get({taskId: $stateParams.taskId}, function (task) {
                                $rootScope.trackerTitle = '(' + reportFor + '): ' + task.title;
                            });

                        });


                    }
                    else if ($state.is('app.assigned-tasks')) {
                        $rootScope.trackerTitle = 'My tasks';
                    }
                    else if ($state.is('app.tags-find')) {
                        $rootScope.trackerTitle = 'Search by tags';
                    }
                    else if ($state.is('app.task-search')) {
                        $rootScope.trackerTitle = 'Search';
                    }
                    else if ($state.is('app.tasks-archive')) {
                        Task.get({taskId: $stateParams.taskId}, function (task) {
                            if (task) {
                                $rootScope.trackerTitle = task.title + ' | ' + 'Archive';
                            }
                        });
                    }
                    else if ($state.is('app.projects-archive')) {
                        $rootScope.trackerTitle = 'Archive';
                    }
                    else if ($state.is('app.profile')) {
                        $rootScope.trackerTitle = 'Profile';
                    }
                    else if ($state.is('app.login')) {
                        $rootScope.trackerTitle = 'Login in to your Tracker';
                    }
                    else if ($state.is('app.register')) {
                        $rootScope.trackerTitle = 'Registration';
                    }
                    else if ($state.is('app.reset-password')) {
                        $rootScope.trackerTitle = 'Reset Password';
                    }
                    else if ($state.is('public.change-password')) {
                        $rootScope.trackerTitle = 'Change Password';
                    }
                    else {
                        $rootScope.trackerTitle = 'Tracker';
                    }
                });

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
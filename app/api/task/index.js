module.exports = function (app) {
  var GridFS = app.container.get('GridFS');
  var FormService = app.container.get('FormService');
  var TaskService = app.container.get('TaskService');

  var Task = require('../../models/task');
  var User = require('../../models/user');

  var async = require('async');
  var _ = require('lodash');
  var form = require("express-form"),
    field = form.field;

  var limit = 60;

  var TaskForm = form(
    field("title").trim().required(),
    field("description").trim(),
    field("spenttime").trim().isNumeric(),
    field("status").trim(),
    field("priority").trim().isInt(),
    field("complexity").trim().isInt(),
    field("developer"),
    field("team").array(),
    field("files").array(),
    field("tags").array(),
    field("tagsList").array(),
    field("archived").trim()
  );

  app.get('/api/tasks', function (req, res) {
    var page = parseInt(req.query.page) || 0;

    var q = {
      parentTaskId: null,
      $or: [
        {owner: req.user},
        {team: req.user}
      ],
      archived: {$ne: true}
    };

    Task
      .find(q)
      .populate('owner', '-local.passwordHashed -local.passwordSalt')
      .populate('developer', '-local.passwordHashed -local.passwordSalt')
      .sort('-priority date')
      //@@FIXME
      .skip(page * limit)
      .limit(limit)
      .exec(function (err, tasks) {
        if (err) return console.log(err);
        res.json(tasks);
      });
  });

  app.get('/api/tasks/archived', function (req, res, next) {
    var query = {
      parentTaskId: null,
      archived: true
    };

    TaskService.getTasksByQuery(query, function (err, tasks) {
      if (err) {
        return next(err);
      }

      res.json(tasks);
    });
  });

  app.param('taskId', function (req, res, next, taskId) {
    Task
      .findById(taskId)
      .populate('owner', '-local.passwordHashed -local.passwordSalt')
      .populate('developer', '-local.passwordHashed -local.passwordSalt')
      .exec(function (err, task) {
        if (err) {
          return next(err);
        }

        if (!task) {
          res.sendStatus(404);
        } else {
          TaskService.hasAccess(task, req.user, function (err, access) {
            if (err) {
              return next(err);
            }

            if (access) {
              req.Task = task;

              TaskService.findVelocity(req.Task, function (err, velocity) {
                if (err) {
                  return next(err);
                }

                if (req.Task.status !== 'accepted') {
                  req.Task.estimatedTime = velocity ? req.Task.points / velocity : 0;
                }

                if (req.Task.estimatedTime !== 0) {
                  req.Task.timeToDo = req.Task.estimatedTime - req.Task.spenttime;
                } else {
                  req.Task.timeToDo = 0;
                }

                next();
              });
            } else {
              res.sendStatus(403);
            }
          });
        }
      });
  });

  app.get('/api/tasks/:taskId', function (req, res) {
    res.json(req.Task);
  });

  //________________________________________________________

  app.get('/api/tasks/:taskId/move', function (req, res, next) {
    var excludeArchived = function (tasks) {
      return _.filter(tasks, function (task) {
        return task.archived == false;
      });
    };

    var tasks = [];
    // grand parent
    // children of grand parent
    // current task children

    TaskService.getGrandParent(req.Task, function (err, grandParent) {
      if (err) {
        return next(err);
      }

      if (grandParent) {
        tasks.push(grandParent);

        TaskService.getChildren(grandParent, function (err, children) {
          if (err) {
            return next(err);
          }

          tasks = tasks.concat(children);

          TaskService.getSiblings(req.Task, function (err, siblings) {
            if (err) {
              return next(err);
            }

            tasks = tasks.concat(siblings);
            tasks = excludeArchived(tasks);

            res.json(tasks);
          });
        })
      }
      else {
        TaskService.getSiblings(req.Task, function (err, siblings) {
          if (err) {
            return next(err);
          }

          async.each(siblings, function (neighbor, next) {
              TaskService.hasAccess(neighbor, req.user, function (err, access) {
                if (err) {
                  return next(err);
                }

                if (access) {
                  tasks.push(neighbor);
                  next();
                } else {
                  next();
                }
              });
            },
            function (err) {
              if (err) {
                return next(err);
              }

              tasks = excludeArchived(tasks);
              res.json(tasks);
            });
        });
      }
    });
  });

  app.get('/api/tasks/:taskId/team', function (req, res, next) {
    TaskService.getRoot(req.Task, function (err, root) {
      if (err) {
        return next(err);
      }

      var team = root.team;

      team.push(root.owner);

      User.find({_id: {$in: team}}, '-local.passwordHashed -local.passwordSalt')
        .exec(function (err, users) {
          if (err) {
            return next(err);
          }

          res.json(users);
        });
    });
  });

  //________________________________________________________

  app.get('/api/tasks/:taskId/tasks', function (req, res) {
    //var page = parseInt(req.query.page) || 0;

    TaskService.getChildrenByParent(req.Task, function (err, tasks) {
      if (err) {
        return next(err);
      }

      res.json(tasks);
    });
  });


  app.get('/api/tasks/:taskId/archive', function (req, res) {
    var query = {
      parentTaskId: req.Task._id,
      archived: true
    };

    TaskService.getTasksByQuery(query, function (err, tasks) {
      if (err) {
        return next(err);
      }

      res.json(tasks);
    });
  });

  //________________________________________________________

  app.post('/api/tasks', TaskForm, FormService.validate, function (req, res, next) {
    var data = {
      user: req.user,
      task: req.form
    };

    var taskData = TaskService.prepareTask(data);

    TaskService.createNewTask(taskData, function (err, _task) {
      if (err) {
        return next(err);
      }

      res.json(_task);
    });
  });

  app.post('/api/tasks/:taskId/tasks', TaskForm, FormService.validate, function (req, res, next) {
    var data = {
      user: req.user,
      task: req.form,
      parentTaskId: req.params.taskId
    };

    var taskData = TaskService.prepareTask(data);

    TaskService.createNewTask(taskData, function (err, _task) {
      if (err) {
        return next(err);
      }

      TaskService.updateParentByTask(_task, function (err) {
        if (err) {
          return next(err);
        }

        res.json(_task);
      });
    });
  });

  app.delete('/api/tasks/:taskId/files/:fileId', function (req, res, next) {
    Task.update({_id: req.Task._id}, {$pull: {'files': {_id: req.params.fileId}}}, function (err) {
      if (err) next(err);

      GridFS.removeFile({_id: req.params.fileId}, function (err) {
        if (err) next(err);

        res.sendStatus(200);
      });
    });
  });

  app.delete('/api/tasks/:taskId', function (req, res, next) {
    req.Task.remove(function (err) {
      if (err) {
        return next(err);
      }

      TaskService.removeFiles(req.Task);

      TaskService.removeChildren(req.Task, function (err) {
        if (err) {
          return next(err);
        }

        TaskService.updateParentByTask(req.Task, function (err) {
          if (err) {
            return next(err);
          }

          res.sendStatus(200);
        });
      });
    });
  });

  app.put('/api/tasks/:taskId', TaskForm, FormService.validate, function (req, res, next) {
    var task = req.Task;
    var preCalculateEstimate = false;

    _.assign(task, req.form);
    task.parentTaskId = req.body.parentTaskId || null;
    task.team = task.team || [req.user];
    task.developer = task.developer || req.user;

    if (req.Task.status !== 'accepted' && req.form.status === 'accepted') {
      preCalculateEstimate = true;
    }

    TaskService.preCalculateEstimatedTime(task, preCalculateEstimate, function (err, task) {
      if (err) {
        return next(err);
      }

      TaskService.calculate(task, function (err, _task) {
        if (err) {
          return next(err);
        }

        _task.save(function (err, task) {
          if (err) {
            return next(err);
          }

          TaskService.updateParentByTask(task, function (err) {
            if (err) {
              return next(err);
            }

            res.json(task);
          });
        });
      });
    });
  });

  //@@@ update task info/fields on move
  //TaskForm, FormService.validate,
  app.put('/api/tasks/:taskId/move/:parentTaskId', function (req, res, next) {
    TaskService.getParent(req.Task, function (err, parent) {
      if (err) {
        return next(err);
      }

      TaskService.getTaskById(req.params.parentTaskId, function (err, newParent) {
        if (err) {
          return next(err);
        }

        if (!newParent) {
          return res.sendStatus(404);
        }

        req.Task.parentTaskId = newParent._id;

        req.Task.save(function (err, task) {
          if (err) {
            return next(err);
          }

          TaskService.updateParent(parent, function (err) {
            if (err) {
              return next(err);
            }

            TaskService.updateParentByTask(task, function (err) {
              if (err) {
                return next(err);
              }

              res.json(task);
            });
          });
        });
      });
    });
  });

  //_________________________go to current project

  app.get('/api/tasks/:taskId/root', function (req, res, next) {
    TaskService.getRoot(req.Task, function (err, root) {
      if (err) {
        return next(err);
      }

      res.json(root);
    });
  });

  //________________________search

  app.get('/api/tasks/:taskId/search', function (req, res, next) {
    var query = req.query.query || '';
    query = query.toString().toLowerCase().trim();

    TaskService.getRoot(req.Task, function (err, root) {
      if (err) {
        return next(err);
      }

      TaskService.deepFind(root, function (task) {
        var tags = task.tags || [];
        tags = tags.join(' ');

        var textQuery = ('' + task.title + ' ' + task.description + tags).toLowerCase();
        var queryArr = query.split(' ');
        var result = 0;

        queryArr.forEach(function (q) {
          if (textQuery.indexOf(q) >= 0) {
            result += 1;
          }
        });

        return !!(queryArr.length === result);
      }, function (err, tasks) {
        if (err) {
          return next(err);
        }
        
        res.json(tasks);
      });
    });
  });

  //___________________________________tags

  app.get('/api/tasks/:taskId/tags/tagsList', function (req, res, next) {
    //sorting
    TaskService.getRoot(req.Task, function (err, root) {
      if (err) {
        return next(err);
      }

      res.json(root.tagsList);
    });
  });

  app.get('/api/tasks/:taskId/tags', function (req, res, next) {
    var q = req.query.query || [];

    TaskService.getRoot(req.Task, function (err, root) {
      if (err) {
        return next(err);
      }

      TaskService.deepFind(root, function (task) {
        var counter = 0;

        q.forEach(function (tag, i) {
          counter += (task.tags.indexOf(tag) >= 0) ? 1 : 0;
        });

        return !!(counter === q.length);
      }, function (err, tasks) {
        if (err) {
          return next(err);
        }
        
        res.json(tasks);
      });
    });
  });

  //__________________________error log

  app.use(function (err, req, res, next) {
    if (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
    else {
      next();
    }

  });
};
module.exports = function (app) {

  var Task = require('../../models/task');
  var TaskService = app.container.get('TaskService');
  var moment = require('moment');
  var async = require('async');
  var _ = require('lodash');

  var getStartDate = function (date) {
    return moment(date).startOf('day').toDate()
  };

  var getEndDate = function (date) {
    return moment(date).endOf('day').toDate();
  };

  app.get('/api/tasks/report/:date', function (req, res) {
    var date = Date.parse(req.params.date);
   
    Task.find({
        updatedAt: {$gte: getStartDate(date), $lte: getEndDate(date)}
      })
      .sort('-updatedAt')
      .exec(function (err, tasks) {
        if (err) {
          // @@@slava add next
          return next(err);
        }

        var tasksReport = [];

        async.each(tasks, function (task, next) {
          TaskService.hasAccess(task, req.user, function (err, access) {
            if (access) {
              tasksReport.push(task);
              next();
            } else {
              next();
            }
          });
        }, function (err) {
          if (err) {
            return res.json([]);
          }

          res.json(tasksReport);
        });
      });
  });

  app.get('/api/tasks/:taskId/report/:date', function (req, res, next) {
    var date = Date.parse(req.params.date) || Date.now();

    var match = {
      updatedAt: {$gte: getStartDate(date), $lte: getEndDate(date)}
    };

    var updatedTasks = [];

    if (!req.Task) {
      return res.json(updatedTasks);
    } else {
      if (req.query.userId !== '') {
        if (req.Task.developer._id.toString() == req.query.userId.toString()) {
          updatedTasks.push(req.Task);
        }
      } else {
        updatedTasks.push(req.Task);
      }

      TaskService.deepFindByQuery(req.Task, match, function (err, tasks) {
        if (err) {
          return next(err);
        }

        if (req.query.userId !== '') {
          tasks = _.filter(tasks, function (task) {
            return task.developer.toString() == req.query.userId.toString();
          });
        }

        updatedTasks = updatedTasks.concat(tasks);

        res.json(updatedTasks);
      });
    }
  });
};
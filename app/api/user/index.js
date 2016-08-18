module.exports = function (app) {
  var TaskService = app.container.get('TaskService');
  var User = app.container.get('User');

  app.get('/api/users/:userId', function (req, res, next) {
    User.findById(req.params.userId, '-local.passwordHashed -local.passwordSalt', function (err, user) {
      if (err) {
        return next(err);
      }
      
      res.json(user);
    });
  });

  app.get('/api/users/:userId/tasks', function (req, res, next) {
    var query = {
      $and: [
        {developer: req.user},
        {
          $and: [
            {
              status: {$ne: 'accepted'}
            },
            {
              archived: {$ne: true}
            }
          ]
        }

      ]
    };
    
    TaskService.getTasksByQuery(query, function (err, tasks) {
      if (err) {
        return next(err);
      }

      res.json(tasks);
    });
  });
};

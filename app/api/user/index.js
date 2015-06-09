module.exports = function (app) {

    var Task = require('../../models/task');

    app.get('/api/users/:userId/tasks', function (req, res, next) {

        var q = {
            $and: [
                {developer: req.user},
                {
                    status: {$ne: 'accepted'}
                }
            ]
        };
        Task.find(q)
            .sort('-updatedAt')
            .populate('owner', '-local.passwordHashed -local.passwordSalt')
            .populate('developer', '-local.passwordHashed -local.passwordSalt')
            .exec(function (err, tasks) {
                if (err) return next(err);
                res.json(tasks);
            });
    });
};

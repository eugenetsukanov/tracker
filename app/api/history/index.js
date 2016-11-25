module.exports = function (app) {
    var TaskHistory = app.container.get('TaskHistory');
    var TaskComment = app.container.get('TaskComment');
    var UserService = app.container.get('UserService');
    var FormService = app.container.get('FormService');
    var TaskService = app.container.get('TaskService');

    var form = require("express-form"),
        field = form.field;

    var commentForm = form(
        field("text").trim().required()
    );

    app.post('/api/tasks/:taskId/history/comments', commentForm, FormService.validate, function (req, res, next) {

        var comment = new TaskComment();
        comment.task = req.Task._id;
        comment.user = UserService.getUserId(req.user);
        comment.text = req.form.text;

        comment.save(function (err) {
            if (err) {
                return next(err);
            }
            TaskService.notifyUsers(req.Task, 'comment.save', function (err) {
                if (err) {
                    return next(err);
                }
                TaskService.updateCommentsCounter(req.Task, function (err) {
                    if (err) {
                        return next(err);
                    }

                    res.sendStatus(200);
                });
            })

        })
    });

    app.get('/api/tasks/:taskId/history', function (req, res, next) {
        var query = {
            task: req.Task
        };
        TaskHistory.find(query)
            .populate('user', 'first last')
            .populate('developer', 'first last')
            .sort('-updatedAt')
            .exec(function (err, messages) {
                if (err) {
                    return next(err);
                }
                res.status(200).json(messages);
            })

    });

};

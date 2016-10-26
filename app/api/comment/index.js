module.exports = function (app) {
    var TaskComment = app.container.get('TaskComment');
    var UserService = app.container.get('UserService');
    var FormService = app.container.get('FormService');

    var form = require("express-form"),
        field = form.field;

    var commentForm = form(
        field("text").trim().required()
    );

    app.get('/api/tasks/:taskId/comments', function (req, res, next) {
        var query = {
            task: req.Task._id
        };
        TaskComment.find(query)
            .populate('user')
            .sort('-updatedAt')
            .exec(function (err, comments) {
                if (err) {
                    return next(err);
                }
                if (!comments) {
                    return res.sendStatus(404);
                }
                res.status(200).send(comments);
            })

    });

    app.post('/api/tasks/:taskId/comments', commentForm, FormService.validate, function (req, res, next) {

        var comment = new TaskComment();
        comment.task = req.Task._id;
        comment.user = UserService.getUserId(req.user);
        comment.text = req.form.text;

        comment.save(function (err) {
            if (err) {
                return next(err);
            }
            res.sendStatus(200);

        })
    });
};

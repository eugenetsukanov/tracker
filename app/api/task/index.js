module.exports = function (app) {

    var form = require("express-form"),
        field = form.field;

    var TaskForm = form(
        field("title").trim().required()
    );

    var Task = require('../../models/task');

    app.get('/api/tasks', function (req, res) {
        Task.find(function (err, tasks) {
            res.json(tasks);
        })
    });

    app.post('/api/tasks', TaskForm, function (req, res) {


        if (req.form.isValid) {
            var task = new Task(req.form);
            task.save(function (err, task) {
                res.json(task);
            });
        }
        else {
            res.sendStatus(400);
        }

    });

    app.param('taskId', function (req, res, next, taskId) {

        Task.findById(taskId, function (err, task) {
            req.Task = task;
            next();
        });
    });

    app.delete('/api/tasks/:taskId', function (req, res) {

        req.Task.remove(function () {
            res.sendStatus(200);
        });

    });

    app.put('/api/tasks/:taskId', TaskForm, function (req, res) {

        var task = req.Task;

        if (req.form.isValid) {
            task.title = req.form.title;

            task.save(function (err, task) {
                res.json(task);
            });
        }
        else {
            res.sendStatus(400);
        }

    });

}
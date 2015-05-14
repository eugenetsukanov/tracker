module.exports = function (app) {

    var Task = require('../../models/task');
    var moment = require('moment');

    var getStartDate = function (date) {
        return moment(date).startOf('day').toDate()
    };

    var getEndDate = function (date) {
        return moment(date).startOf('day').add(1, 'd').toDate();
    };

    app.get('/api/report/date/:date', function (req, res) {

        var date = Date.parse(req.params.date);
        Task.find({updatedAt: {$gt: getStartDate(date), $lt: getEndDate(date)}}).sort('-updatedAt').exec(function (err, tasks) {
            res.json(tasks);
        })
    });

    app.get('/api/report/task/:taskId', function (req, res) {

        var date = new Date();
        var query = {
            updatedAt: {$gt: getStartDate(date), $lt: getEndDate(date)},
            $or: [
                { _id: req.params.taskId },
                { parentTaskId: req.params.taskId }
            ]
        };

        Task.find(query).sort('-updatedAt').exec(function (err, tasks) {
            res.json(tasks);
        });
    });

};
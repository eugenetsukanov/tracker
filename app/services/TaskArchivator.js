module.exports = function () {

    var Task = require('../models/task');


    var query = {
        status: 'accepted',
        updatedAt: {"$gte": new Date(2012, 7, 14)},
        archived: {$ne: true}
    };

    Task.archive(query);


    //moment("20120620", "YYYYMMDD").fromNow();

    //Task.find(q, function () {
    //
    //})



};
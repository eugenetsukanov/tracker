var id = require('pow-mongodb-fixtures').createObjectId;

function ObjectId(str) {
    return id(str);
}

function ISODate(date) {
    return new Date(date);
}

exports.tasks = [
    {
        "_id" : ObjectId("551540d7210f64444cde2327"),
        "title" : "task 1",
        "status" : "",
        "estimatedTime" : 0,
        "simple" : false,
        "date" : ISODate("2015-03-27T11:36:55.983Z"),
        "parentTaskId" : null,
        "velocity" : 1,
        "points" : 3,
        "complexity" : null,
        "spenttime" : 0,
        "priority" : null,
        "__v" : 0
    },
    {
        "_id" : ObjectId("551540e2210f64444cde2328"),
        "title" : "task 1.1",
        "status" : "accepted",
        "estimatedTime" : 0,
        "simple" : false,
        "date" : ISODate("2015-03-27T11:37:06.395Z"),
        "parentTaskId" : ObjectId("551540d7210f64444cde2327"),
        "velocity" : 1,
        "points" : 1,
        "complexity" : 1,
        "spenttime" : 1,
        "priority" : null,
        "__v" : 0
    },
    {

        "_id" : ObjectId("551540ec210f64444cde2359"),
        "title" : "task 1.1.1",
        "status" : "",
        "estimatedTime" : 0,
        "simple" : true,
        "date" : ISODate("2015-03-27T11:37:16.072Z"),
        "parentTaskId" : ObjectId("551540e2210f64444cde2328"),
        "velocity" : 0,
        "points" : 2,
        "complexity" : 2,
        "spenttime" : null,
        "priority" : null,
        "__v" : 0
    },
    {

        "_id" : ObjectId("551540ec210f64444cde2329"),
        "title" : "task 1.2",
        "status" : "",
        "estimatedTime" : 0,
        "simple" : true,
        "date" : ISODate("2015-03-27T11:37:16.072Z"),
        "parentTaskId" : ObjectId("551540d7210f64444cde2327"),
        "velocity" : 0,
        "points" : 2,
        "complexity" : 2,
        "spenttime" : null,
        "priority" : null,
        "__v" : 0
    }


];
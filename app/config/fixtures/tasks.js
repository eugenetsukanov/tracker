var id = require('pow-mongodb-fixtures').createObjectId;

function ObjectId(str) {
    return id(str);
}

function ISODate(date) {
    return new Date(date);
}

exports.tasks = [
    {
        "_id" : ObjectId("55144308d32b3bfa49852773"),
        "title" : "task 1",
        "status" : "",
        "simple" : false,
        "date" : ISODate("2015-03-26T17:34:00.140Z"),
        "parentTaskId" : null,
        "velocity" : 4,
        "points" : 16,
        "complexity" : null,
        "spenttime" : 13.5,
        "priority" : null,
        "__v" : 0
    },
    {
        "_id" : ObjectId("5514430dd32b3bfa49852774"),
        "title" : "task 2",
        "status" : "",
        "simple" : true,
        "date" : ISODate("2015-03-26T17:34:05.475Z"),
        "parentTaskId" : null,
        "velocity" : 0,
        "points" : 0,
        "complexity" : null,
        "spenttime" : null,
        "priority" : null,
        "__v" : 0
    },
    {
        "_id" : ObjectId("55144361d32b3bfa49852775"),
        "title" : "task 1.1",
        "status" : "accepted",
        "simple" : true,
        "date" : ISODate("2015-03-26T17:35:29.929Z"),
        "parentTaskId" : ObjectId("55144308d32b3bfa49852773"),
        "velocity" : 4,
        "points" : 8,
        "complexity" : 5,
        "spenttime" : 2,
        "priority" : 5,
        "__v" : 0
    },
    {
        "_id" : ObjectId("55144388d32b3bfa49852776"),
        "title" : "task 1.2",
        "status" : "in progress",
        "simple" : true,
        "date" : ISODate("2015-03-26T17:36:08.869Z"),
        "parentTaskId" : ObjectId("55144308d32b3bfa49852773"),
        "velocity" : 0,
        "points" : 5,
        "complexity" : 4,
        "spenttime" : 5,
        "priority" : 8,
        "__v" : 0
    },
    {
        "_id" : ObjectId("5514439fd32b3bfa49852777"),
        "title" : "task 1.3",
        "status" : "",
        "simple" : false,
        "date" : ISODate("2015-03-26T17:36:31.636Z"),
        "parentTaskId" : ObjectId("55144308d32b3bfa49852773"),
        "velocity" : 0.5,
        "points" : 3,
        "complexity" : 10,
        "spenttime" : 6.5,
        "priority" : 0,
        "__v" : 0
    },
    {
        "_id" : ObjectId("551443cad32b3bfa49852778"),
        "title" : "task 1.3.1",
        "status" : "accepted",
        "simple" : true,
        "date" : ISODate("2015-03-26T17:37:14.047Z"),
        "parentTaskId" : ObjectId("5514439fd32b3bfa49852777"),
        "velocity" : 0.5,
        "points" : 2,
        "complexity" : 2,
        "spenttime" : 4,
        "priority" : 5,
        "__v" : 0
    },
    {
        "_id" : ObjectId("551443dcd32b3bfa49852779"),
        "title" : "task 1.3.2",
        "status" : "in progress",
        "simple" : true,
        "date" : ISODate("2015-03-26T17:37:32.297Z"),
        "parentTaskId" : ObjectId("5514439fd32b3bfa49852777"),
        "velocity" : 0,
        "points" : 1,
        "complexity" : 1,
        "spenttime" : 2.5,
        "priority" : 6,
        "__v" : 0
    }

];
var id = require('pow-mongodb-fixtures').createObjectId;

function ObjectId(str) {
    return id(str);
}

exports.users = [
    {
        "_id" : ObjectId("5514462ae4eb270b4f115c2c"),
        local: {
            username: 'test',
            "passwordHashed" : "fda8e930419f06a6581723af973783ab3b3290de6d80f32f85fa5ea719521c50",
            "passwordSalt" : "767d93afc0aac50f5983561e4bc145686dec7e86ef57fdf3bd8f46e7b24aeb9f"
        }
    }
];
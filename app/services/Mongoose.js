var Mongoose = function (uri) {

    var mongoose = require('mongoose');
    mongoose.connect(uri);

    return mongoose;
};

module.exports = Mongoose;
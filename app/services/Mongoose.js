var Mongoose = function (config) {

    var mongoose = require('mongoose');
    mongoose.set('debug', config.debug);
    mongoose.connect(config.uri);

    return mongoose;
};

module.exports = Mongoose;
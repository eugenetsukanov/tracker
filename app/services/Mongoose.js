var Mongoose = function (config) {

  // @@@slava solve issues with promises
  var options = {promiseLibrary: require('bluebird')};

  var mongoose = require('mongoose');
  mongoose.set('debug', config.debug);
  mongoose.connect(config.uri, options);

  return mongoose;
};

module.exports = Mongoose;
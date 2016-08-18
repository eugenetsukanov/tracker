module.exports = function (container) {
  // mongoose
  container.register('Mongoose', require('../services/Mongoose'), ['config/mongo']);
  container.register('MongoSessionStore', require('../services/MongoSessionStore'), ['config/mongo/uri']);

  // models
  container.register('User', require('../models/user'), ['Mongoose']);
  container.register('Task', require('../models/task'), ['Mongoose']);

  // services
  container.register('FileService', require('../services/FileService'), ['GridFS']);
  container.register('TaskService', require('../services/TaskService'), ['Task', 'FileService', 'UserService']);
  container.register('UserService', require('../services/UserService'), ['User']);

  container.register('GridFS', require('../services/GridFS'), ['config/mongo/uri']);
  container.register('Tokenizer', require('../services/Tokenizer'), ['config/tokenizer/secret']);
  container.register('Mailer', require('../services/Mailer'), ['config']);
  container.register('Host', require('../services/Host'), ['config/host/url']);
  container.register('Cron', require('../services/Cron'));
  container.register('TaskArchivator', require('../services/TaskArchivator'), ['Task']);

  container.register('SocketService', require('../services/SocketService'), ['MongoSessionStore', 'config/session/secret']);
  container.register('FormService', require('../services/FormService'), []);

};
module.exports = function (container) {
  // mongoose
  container.register('Mongoose', require('../services/Mongoose'), ['config/mongo']);
  container.register('MongoSessionStore', require('../services/MongoSessionStore'), ['config/mongo/uri']);

  // models
  container.register('User', require('../models/user'), ['Mongoose']);
  container.register('Task', require('../models/task'), ['Mongoose']);
  container.register('TaskHistory', require('../models/taskHistory'), ['Mongoose']);
  container.register('TaskComment', require('../models/taskComment'), ['Mongoose', 'TaskHistory']);
  container.register('TaskStatus', require('../models/taskStatus'), ['Mongoose', 'TaskHistory']);
  container.register('TaskSpenttime', require('../models/taskSpenttime'), ['Mongoose', 'TaskHistory']);
  container.register('TaskMetrics', require('../models/taskMetrics'), ['Mongoose', 'TaskHistory']);
  container.register('TaskDescription', require('../models/taskDescription'), ['Mongoose', 'TaskHistory']);
  container.register('TaskDeveloper', require('../models/taskDeveloper'), ['Mongoose', 'TaskHistory']);
  container.register('TaskComplexity', require('../models/taskComplexity'), ['Mongoose', 'TaskHistory']);

  // classes
  container.register('StatusWriter', require('../historyWriters/StatusWriter'), ['TaskStatus']);
  container.register('MetricsWriter', require('../historyWriters/MetricsWriter'), ['TaskMetrics']);
  container.register('SpenttimeWriter', require('../historyWriters/SpenttimeWriter'), ['TaskSpenttime']);
  container.register('DescriptionWriter', require('../historyWriters/DescriptionWriter'), ['TaskDescription']);
  container.register('DeveloperWriter', require('../historyWriters/DeveloperWriter'), ['TaskDeveloper']);
  container.register('ComplexityWriter', require('../historyWriters/ComplexityWriter'), ['TaskComplexity']);


  // services
  container.register('FileService', require('../services/FileService'), ['GridFS']);
  container.register('TaskService', require('../services/TaskService'), ['Task', 'FileService', 'UserService', 'SocketService','HistoryService', 'TaskComment']);
  container.register('UserService', require('../services/UserService'), ['User']);

  container.register('HistoryService', require('../services/HistoryService'), ['HistoryService.historyWriters']);

  container.register('HistoryService.historyWriters', function () {
    return container.find(['taskHistoryWriter']);
  });

  container.register('GridFS', require('../services/GridFS'), ['config/mongo/uri']);
  container.register('Tokenizer', require('../services/Tokenizer'), ['config/tokenizer/secret']);
  container.register('Mailer', require('../services/Mailer'), ['config']);
  container.register('Host', require('../services/Host'), ['config/host/url']);
  container.register('Cron', require('../services/Cron'));
  container.register('TaskArchivator', require('../services/TaskArchivator'), ['Task']);

  container.register('SocketService', require('../services/SocketService'), ['MongoSessionStore', 'config/session/secret']);
  container.register('FormService', require('../services/FormService'), []);

};
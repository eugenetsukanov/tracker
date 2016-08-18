module.exports = function (container) {
    container.register('Mongoose', require('../services/Mongoose'), ['config/mongo']);
    container.register('GridFS', require('../services/GridFS'), ['config/mongo/uri']);
    container.register('Tokenizer', require('../services/Tokenizer'), ['config/tokenizer/secret']);
    container.register('Mailer', require('../services/Mailer'), ['config']);
    container.register('Host', require('../services/Host'), ['config/host/url']);
    container.register('Cron', require('../services/Cron'));
    container.register('TaskArchivator', require('../services/TaskArchivator'));
    container.register('MongoSessionStore', require('../services/MongoSessionStore'), ['config/mongo/uri']);
    container.register('SocketService', require('../services/SocketService'), ['MongoSessionStore', 'config/session/secret']);
    container.register('FormService', require('../services/FormService'), []);

    // @@@slava make domain models in the container
    // @@@slava re-connect models in the controllers/services
    
    //container.register('Task', require('../models/task'), []);
    container.register('FileService', require('../services/FileService'), ['GridFS']);
    container.register('TaskService', require('../services/TaskService'), ['FileService']);

    //container.register('models', function () {
    //    var mongoose = require('mongoose');
    //    return {
    //        get: function (model) {
    //            return mongoose.model(model);
    //        }
    //    };
    //});
};
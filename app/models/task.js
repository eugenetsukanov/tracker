var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');
var async = require('async');

var application = require('../config/application');
var GridFS = application.get('GridFS');

var FileSchema = require('./file.schema');

var TaskSchema = new Schema({
  title: String,
  description: String,
  user: String,
  priority: {type: Number, default: 5, index: true},
  status: String,
  spenttime: {type: Number, default: 0},
  complexity: {type: Number, default: 0},
  points: {type: Number, default: 0},
  _velocity: [Number],
  parentTaskId: {type: Schema.Types.ObjectId, ref: "Task", default: null},
  date: {type: Date, default: Date.now, index: true},
  updatedAt: {type: Date, default: null, index: true},
  simple: {type: Boolean, default: true},
  estimatedTime: {type: Number, default: 0},
  timeToDo: {type: Number, default: 0},
  owner: {type: Schema.Types.ObjectId, ref: "User"},
  developer: {type: Schema.Types.ObjectId, ref: "User", default: null},
  team: [{type: Schema.Types.ObjectId, ref: "User", default: []}],
  files: [FileSchema],
  tags: [String],
  tagsList: [String],
  archived: {type: Boolean, default: false}
});

TaskSchema.set('toJSON', {getters: true, virtuals: true});

TaskSchema.methods = {
  getRoot: function (next) {
    if (this.parentTaskId) {
      this.getParent(function (err, parent) {
        if (err) return next(err);
        parent.getRoot(next);
      });
    } else {
      Task.findById(this._id)
        .sort('-updatedAt')
        .populate('owner', '-local.passwordHashed -local.passwordSalt')
        .populate('developer', '-local.passwordHashed -local.passwordSalt')
        .exec(next);
    }
  },
  countChildren: function (next) {
    Task.count({parentTaskId: this._id}, next);
  },
  removeFiles: function (next) {
    next = next || new Function();
    GridFS.remove(this.files, next);
  },
  connectFiles: function (next) {
    next = next || new Function();
    GridFS.connect(this.files, next);
  },
  updateRootTags: function (next) {
    next = next || new Function();

    var self = this;

    var originTags = self._origin && self._origin.tags || [];

    var glue = '|||';

    var tagsModified =
      (self.tags.length || originTags.length)
      && (self.tags.join(glue) != originTags.join(glue));

    if (!tagsModified) return next();

    this.getRoot(function (err, root) {
      if (err) return next(err);

      root.tagsList = _.uniq(root.tagsList.concat(self.tags));

      root.save(function (err) {
        if (err) return next(err);
        next();
      });
    });
  }
};

TaskSchema.statics.archive = function (query, next) {
  Task.update(query, {$set: {archived: true}}, {multi: true}, function (err) {
    if (err) return next(err);
    next();
  });
};

TaskSchema.pre('init', function (next, task) {
  this._origin = _.merge({}, task);
  next();
});

TaskSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
  // this.calculate(next);
});

//TaskSchema.post('save', function (task) {
//    task.connectFiles();
//    task.updateRootTags();
//});

//TaskSchema.post('remove', function (task) {
  //task.removeFiles();
//});

// TODO @@@id: remove velocity virtual field
TaskSchema.virtual('velocity').get(function () {
  var result = 0;

  if (this._velocity.length) {
    var velositySum = 0;

    _.forEach(this._velocity, function (velocity) {
      velositySum += velocity;
    });

    result = velositySum / this._velocity.length;
  }

  return result;
});

var Task = mongoose.model('Task', TaskSchema);

module.exports = Task;
module.exports = function (mongoose) {
  var Schema = mongoose.Schema;
  var _ = require('lodash');

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
    //@@@ del _velocity
    _velocity: [Number],
    // @@@slava remove _velocity
    velocity: Number,
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

  TaskSchema.pre('init', function (next, task) {
    this._origin = _.merge({}, task);
    next();
  });

  TaskSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
  });

// @@@slava remove this
// @@@slava check @@@ todos

//// TODO @@@id: remove velocity virtual field
//TaskSchema.virtual('velocity').get(function () {
//  var result = 0;
//
//  if (this._velocity.length) {
//    var velositySum = 0;
//
//    _.forEach(this._velocity, function (velocity) {
//      velositySum += velocity;
//    });
//
//    result = velositySum / this._velocity.length;
//  }
//
//  return result;
//});

  var Task = mongoose.model('Task', TaskSchema);

  return Task;
};
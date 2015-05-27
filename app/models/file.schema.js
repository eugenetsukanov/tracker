var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FileSchema = new Schema(
    {
        _id: Schema.Types.ObjectId,
        filename: String,
        contentType: String,
        length: Number,
        chunkSize: Number,
        uploadDate: Date,
        metadata: {
            originalname: String
        },
        md5: String
    }
);

FileSchema.set('toJSON', {getters: true, virtuals: true});


module.exports = FileSchema;
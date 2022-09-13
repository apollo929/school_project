const mongoose = require('mongoose');
require('mongoose-double')(mongoose);

const Schema = mongoose.Schema;

const SubjectSchema = new Schema(
  {
    classes: String,
    studentname: String,
    maths: { type: mongoose.Schema.Types.Double},
    english: { type: mongoose.Schema.Types.Double},
    physics: { type: mongoose.Schema.Types.Double},
    chemistry: { type: mongoose.Schema.Types.Double},
    history: { type: mongoose.Schema.Types.Double},
    biology: { type: mongoose.Schema.Types.Double},
    sum: { type: mongoose.Schema.Types.Double},
    average: { type: mongoose.Schema.Types.Double},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    avatar: String,
    createdAt: Date,
    updatedAt: Date,
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

SubjectSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

SubjectSchema.index({
  user: 1,
  classes: 1,
  studentname: 1,
  sum: 1,
  average: 1,
});
// CustomerSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

const Subject = mongoose.model('subject', SubjectSchema);

module.exports = Subject;

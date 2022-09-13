const crypto = require('crypto');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    password: String,
    country: String,
    phone: String,
    email: String,
    classes: String,   
    avatar: String,
    role: String,
    hash: String,//
    salt: String,//
    createdAt: Date,//
    updatedAt: Date,
    
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

UserSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

UserSchema.index({ firstName: 1, lastName: 1, email: 1 });

const User = mongoose.model('user', UserSchema);

User.findOne({role : 'admin'}, function(error, result){
  if(!result){
    const user = new User({ firstName: 'Katarina',lastName: 'Smith',email:'hjg@929.com', role:'admin', avatar:'' });
    user.save();
  }
})

module.exports = User;

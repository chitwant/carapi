// grab the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  firstname:{ type: String,required: true},
  lastname: { type: String,required: true},
  email: { type: String, required: true, unique: true },
  password: { type: String}, 
  isactive : {type: Boolean, default: false},
  isdeleted :{type: Boolean, default: false},
  created_at: Date,
  updated_at: Date,
  registration_no: String
});



// the schema is useless so far
// we need to create a model using it


userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(4, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});




/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};


// userSchema.define('comparePassword', function comparePassword(candidatePassword, cb) {
//   bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
//     cb(err, isMatch);
//   });
// }) ;


var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;

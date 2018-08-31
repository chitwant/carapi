// grab the things we need
var mongoose = require('mongoose');
var User = require('../models/User');
var Schema = mongoose.Schema;

// create a schema
var carSchema = new Schema({

  user : {
    type : Schema.Types.ObjectId,
    ref:'User'
  },
    registration_no: { type: String,required: true, unique: true },
    model: { type: String},
    speedometer: { type: Number}, 
    manufacturer : String,
    cost : Number,
    photopath : String,
    status : String,
    isactive : {type: Boolean, default: false},
    isdeleted : {type: Boolean, default: false},
    created_at: Date,
    updated_at: Date
  });
  
  // the schema is useless so far
  // we need to create a model using it
  var Car = mongoose.model('Car', carSchema);

  module.exports = Car;
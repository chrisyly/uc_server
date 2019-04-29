// Node js is commonly using mongoDB, this template gives a simple mongoDB set up
'use strict';
const mongoose = require('mongoose'); // load mongoose module
const Schema = mongoose.Schema; // getting the basic schema object

// Schema is basically the formation for each db data
const Uc_Davis_Schema = new Schema({
  name: {
    type: String,
	unique: true,
	dropDups: true
  },
  created_date: {
    type: Date,
    default: Date.now
  },
  zipcode: {
	type: String,
	unique: true,
	dropDups: true
  },
  max_tu: {
	type: Number,
	default: 0.0
  },
  status: {
    type: [{
      type: String,
      enum: ['pending', 'updated', 'completed']
    }],
    default: ['pending']
  }
});

// export the schema to mongoDB, with the document name 'uc_davis_master'
module.exports = mongoose.model('uc_davis_master', Uc_Davis_Schema);

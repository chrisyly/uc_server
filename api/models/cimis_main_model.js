// Node js is commonly using mongoDB, this template gives a simple mongoDB set up
'use strict';
const mongoose = require('mongoose'); // load mongoose module
const Schema = mongoose.Schema; // getting the basic schema object

const cimis_Schema = new Schema({
  // Station name, unique
  name: {
    type: String,
    required: true,
	unique: true
  },
  // date when getting updated
  Updated_date: {
    type: Date,
    default: Date.now
  },
  // status of current data
  status: {
    type: [{
      type: String,
      enum: ['out of date', 'updated', 'pending']
    }],
    default: ['pending']
  },
  // detailed records schema
  records: {
	type: String,
	ref: 'cimis_record'
  }
});

module.exports = mongoose.model('cimis', cimis_Schema);

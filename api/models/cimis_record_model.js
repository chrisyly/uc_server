// Node js is commonly using mongoDB, this template gives a simple mongoDB set up
'use strict';
const mongoose = require('mongoose'); // load mongoose module
const Schema = mongoose.Schema; // getting the basic schema object

const cimis_Schema = new Schema({
  // Station name, unique
  Date: {
    type: String,
	required: true,
	unique: true
  },
  ZipCodes: [{
  	type: String,
	default: ''
  }],
  DayAirTmpAvg:{
	type:String
  }
});

module.exports = mongoose.model('cimis_record', cimis_Schema);

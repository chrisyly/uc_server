'use strict';

const mongoose = require('mongoose'),
  Task = mongoose.model('cimis'), // mongoDB dependency
  papaparse = require('papaparse'); // PapaParse dependency

// ============== Basic tasks beginning ================= //
exports.list_all_stations = function(req, res) {
  Task.find({}, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};


exports.create_a_station = function(req, res) {
  var new_task = new Task(req.body);
  new_task.save(function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};


exports.read_a_station = function(req, res) {
  Task.find({name:req.params.stationName}, function(err, task) {
	if (err)
      res.send(err);
    res.json(task);
  });
};


exports.update_a_station = function(req, res) {
  Task.findOneAndUpdate({name: req.params.stationName}, req.body, {new: true}, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};


exports.delete_a_station = function(req, res) {
  Task.remove({
    name: req.params.stationName
  }, function(err, task) {
    if (err)
      res.send(err);
    res.json({ message: 'Station successfully deleted' });
  });
};
// ================ Basic tasks ends ================ //

// exports

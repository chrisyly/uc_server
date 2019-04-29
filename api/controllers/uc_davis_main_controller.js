'use strict';

const mongoose = require('mongoose'),
  Task = mongoose.model('uc_davis_master'), // mongoDB dependency
  papaparse = require('papaparse'); // PapaParse dependency

// ============== Basic tasks beginning ================= //
exports.list_all_tasks = function(req, res) {
  Task.find({}, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};


exports.create_a_task = function(req, res) {
  var new_task = new Task(req.query);
  console.log(req.query.name);
  new_task.save(function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};

exports.read_a_task = function(req, res) {
  if (req.params.name) {
    read_by_name(req, res);
  } else if (req.param.zipcode) {
    read_by_zipcode(req, res);
  }
}

function read_by_name(req, res) {
  Task.find({name:req.query.name}, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};

function read_by_zipcode(req, res) {
  Task.find({zipcode:req.query.zipcode}, function(err, task) {
    if (err)
	  res.send(err);
	res.json(task);
  });
};

exports.update_a_task = function(req, res) {
  Task.findOneAndUpdate({_id: req.params.taskId}, req.body, {new: true}, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};


exports.delete_a_task = function(req, res) {
  Task.remove({
    _id: req.params.taskId
  }, function(err, task) {
    if (err)
      res.send(err);
    res.json({ message: 'Task successfully deleted' });
  });
};
// ================ Basic tasks ends ================ //

// exports

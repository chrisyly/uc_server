const express = require('express'),
  server = express(),
  mongoose = require('mongoose'),
  Model = require('./api/models/uc_davis_main_model'), //created model loading here
  //bodyParser = require('body-parser'),
  port = 3000,
  port_test = 8080,
  host_ip = '45.33.57.20',
  host_local_ip = '127.0.0.1';


// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/UcDavisdb', {useNewUrlParser: true}); 

//server.use(bodyParser.urlencoded({ extended: true }));
//server.use(bodyParser.json());

const uc_routes = require('./api/routes/uc_davis_main_route'); //importing route
uc_routes(server); //register the route

server.listen(port, host_ip, () => {
	console.log("server started on: " + host_ip + ":" + port);
});

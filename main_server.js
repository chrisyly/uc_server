const express = require('express'),
  server = express(),
  mongoose = require('mongoose'),
  Task = require('./api/models/uc_davis_main_model'), //created model loading here
  cimis_task = require('./api/models/cimis_main_model'),
  bodyParser = require('body-parser'),
  http_client = require('./api/utility/http_client'),
  port = 3000,
  port_test = 8080,
  host_ip = '45.33.57.20',
  host_local_ip = '127.0.0.1';

/*
//############## simple terminal ################
const http = require("http"),
	terminal = require("web-terminal");

var app = http.createServer(function (req, res) {
	res.writeHead(200, {"Content-Type": "Text/plain"});
	res.end("Welcome to web terminal\n");
});

app.listen(port_test, host_ip);
terminal(app);
//###############################################
*/

// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/UcDavisdb'); 

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

const uc_routes = require('./api/routes/uc_davis_main_route'); //importing route
const cimis_routes = require('./api/routes/cimis_route');
const r_routes = require('./api/routes/r_route');
uc_routes(server); //register the route
cimis_routes(server);
r_routes(server);

server.listen(port, host_ip, () => {
	console.log("server started on: " + host_ip + ":" + port);
});
 /*
http_client.CallbackHttpClient('http://45.33.57.20:3000/tasks/', function(response) {
	console.log(response);
});
*/

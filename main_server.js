const express = require('express'),
  cors = require('cors'),
  server = express(),
  https = require('https'),
  mongoose = require('mongoose'),
  Model = require('./api/models/uc_davis_main_model'), //created model loading here
  fs = require('fs'),
  csr_path = "/home/lying/private/certs/pistachio.plantsciences.ucdavis.edu/"
  http_port = 8000,
  https_port = 8888,
  port_test = 8080,
  host_ip = '0.0.0.0',
  host_local_ip = '127.0.0.1';


// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/UcDavisdb', {useNewUrlParser: true}); 

server.use(cors());

const uc_routes = require('./api/routes/uc_davis_main_route'); //importing route
uc_routes(server); //register the route

/*
server.listen(http_port, host_ip, () => {
  console.log("server started on: " + host_ip + ":" + http_port);
});
*/

https.createServer({
  key: fs.readFileSync(csr_path + 'pistachio.key'),
  cert: fs.readFileSync(csr_path + 'pistachio.pem')
}, server).listen(https_port, host_ip, () => {
  console.log("server started on: " + host_ip + ":" + https_port);
});

// template for adding route
/*
const route_object = require('path to controller');

app.route('/path') //This will adding a route map to ip/dns address, for example 11.22.33.44/hello/world
  .get(route_object.function_call_1) //Adding a get request
  .post(route_object.function_call_2) // Adding a post request
  .delete(route_object.function_call_3) // Adding a delete request
  //.other request

*/

'use strict';
module.exports = function(app) {
  const main_route = require('../controllers/cimis_controller');

  // main routes
  app.route('/cimis')
    .get(main_route.list_all_stations)
	.put(main_route.create_a_station); // TODO

  app.route('/cimis/:stationName')
    .get(main_route.read_a_station) // TODO
    .put(main_route.update_a_station) // TODO
	.delete(main_route.delete_a_station); // TODO

};

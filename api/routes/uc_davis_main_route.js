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
  const main_route = require('../controllers/uc_davis_main_controller');

  // main routes
  app.route('/wudb')
    .get(main_route.get_stations)
    .post(main_route.add_station);

  app.route('/wudb/:stationId')
    .get(main_route.find_by_id)
    .put(main_route.update_station)
    .delete(main_route.delete_a_station);

  app.route('/r')
    .get(main_route.calculate_prediction);
};

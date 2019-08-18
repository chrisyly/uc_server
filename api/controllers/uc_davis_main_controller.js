'use strict';

/* \brief UC Davis main controller
*
*  UC Daivs Main Controller contains:
*  1. The REST API of database methods
*  2. The REST API of calling Algorithm function
*  3. The tool functions support 1 & 2
*
*  @director
*  @project_owner
*  @algorithm_developer
*  @developer Liyu Ying, lying@ucdavis.edu
*/

const mongoose = require('mongoose'), /// mongoose dependency
  db = mongoose.model('uc_davis_master'), /// mongoDB model
  axios = require('axios'), /// axios dependency
  fs = require('fs'); /// Javascript file system dependency

const _WorldWeatherOnline_URL = 'http://api.worldweatheronline.com/premium/v1/', /// World Weather Online API URL
  _WorldWeatherOnline_Key = '1f5fa93d11de4c4cb62174906191606', /// World Weather Online API Key
  oneDay = 86400000; /// Million seconds of one day

/* \brief [Utility] A utility collection
*
*  @return method The Utility functions collection object
*/
var utility = (function() {
  var method = {};
  method.writeToFile = function (path = "/var/www/html/uc_davis/log/", fileName
= "",  message = "") {
    var currentDate = new Date();
    var date = (currentDate.getMonth() + 1) + "-" + currentDate.getDate() + "-"
+ currentDate.getFullYear();
        var time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":"
 + currentDate.getSeconds() + "." + currentDate.getMilliseconds()
    try {
      fs.appendFileSync(path + date + "_" + fileName, "[" + time + "] " + messag
e);
        } catch (err) {
      fs.appendFileSync(path + 'system.log', "[" + time + "] " + err);// TODO
        }
  }
  return method;
});

// ============== Basic api beginning ================= //
/* \brief [GET request] Getting the station from database by either station name or zipcode
*
*  GET REST API, send the response with station JSON based on request parameters
*  Calling find_station(req, res) to read req object and based on parameters looking for
*  "name" and then "zipcode" to load station in database
*
*  @param req HTTP request object
*  @param res HTTP response object
*/
exports.get_stations = function(req, res) {
  find_station(req, res)  
};

/* \brief [POST request] Adding a new station based on req parameters
*
*  POST REST API, send the response with result JSON after adding station to database
*
*  @param req HTTP request object
*  @param res HTTP response object
*/
exports.add_station = function(req, res) {
  var station = new db(req.query);
  console.log(req.query.name);
  station.save(function(err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};

/* \brief [GET request] Getting the station based on the _id recorded in database
*
*  GET REST API, send the response with the station JSON based on _id parameter in req
*
*  @param req HTTP request object
*  @param res HTTP response object
*/
exports.find_by_id = function(req, res) {
  db.find({_id:req.params.stationId}, function(err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};

/* \brief database tool function, send the response with all found stations
*
*  Calling find_by_name if name parameter is provided
*  Else calling find_by_zipcode if zipcode parameter is provided
*  If no parameter of name nor zipcode defined, return all station
*
*  @param req HTTP request object
*  @param res HTTP response object
*/
function find_station(req, res) {
  if (req.query.name) {
    find_by_name(req, res);
  } else if (req.query.zipcode) {
    find_by_zipcode(req, res);
  } else {
    db.find({}, function(err, result) {
      if (err)
        res.send(err);
      res.json(result);
    });
  }
};

/* \brief database tool function, send the response with stations found by name
*
*  Find all matched station in database by station name provided
*  Send the response with the staiton JSON object based on name paramter in req
*
*  @param req HTTP request object
*  @param res HTTP response object
*/
function find_by_name(req, res) {
  db.find({name:req.query.name}, function(err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};

/* \brief database tool function, send the response with stations found by zipcode
*
*  Find all matched station in database by station zipcode provided
*  Send the response with the staiton JSON object based on zipcode paramter in req
*
*  @param req HTTP request object
*  @param res HTTP response object
*/
function find_by_zipcode(req, res) {
  db.find({zipcode:req.query.zipcode}, function(err, result) {
    if (err)
	  res.send(err);
	res.json(result);
  });
};

/* \brief [POST request] Update a station information based on the req stationId parameter
*
*  Find the station by _id and update the station information based on req parameter
*  Send the response with return code from database
*
*  @param req HTTP request object
*  @param res HTTP response object
*/
exports.update_station = function(req, res) {
  console.log(req.params.stationId)
  db.findOneAndUpdate({_id: req.params.stationId}, req.body, {new: true}, function(err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};

/* \brief [DELETE request] Delete a station based on the req stationId parameter
*
*  Find the station by _id and delete the station information from database based on req stationId parameter
*  Send the response with return code from database
*
*  @param req HTTP request object
*  @param res HTTP response object
*/
exports.delete_a_station = function(req, res) {
  db.remove({
    _id: req.params.stationId
  }, function(err, result) {
    if (err)
      res.send(err);
    res.json({ "message": "Task successfully deleted" });
  });
};

exports.message_service = function(req, res) {
  // TODO
};
// ================ Basic api ends ================ //

// R model calculation
exports.calculate_prediction = async function(req, res) {
  console.log(req.query);
  var zipcode;
  var stationName = "No match station found!";
  var startDate;
  var startDay;
  var startMonth;
  var startYear;
  var endDate;
  var endDay;
  var endMonth;
  var endYear;
  var wwoQuery = "";
  var totalTU = 0;
  var currentTU = 0;
  var jsonR;
  if (typeof req.query.zipcode !== undefined) {
    zipcode = req.query.zipcode;
    db.findOne({zipcode: zipcode}, 'zipcode name max_tu', function (err, station) {
      if (err || station == null) {
        res.json({error: err});
		return;
	  } else {
        stationName = station.name;
		totalTU = station.max_tu;
      }
	});
    wwoQuery = _WorldWeatherOnline_URL + 'weather.ashx?key=' + _WorldWeatherOnline_Key + '&q=' + zipcode + '&num_of_days=14&cc=no&tp=24&format=json';
  } else {
    res.json({error: "Invalid zipcode"});
	return;
  }
  if (typeof req.query.startDate !== undefined) {
    startDate = req.query.startDate;
    startMonth = Number(startDate.substring(5,7));
    startDay = Number(startDate.substring(8,10));
    startYear = Number(startDate.substring(0,4));
  } else {
    res.json({error: "Invalid Start Date"});
	return;
  }
  if (typeof req.query.endDate !== undefined) {
    endDate = req.query.endDate;
    endMonth = Number(endDate.substring(5,7));
	endDay = Number(endDate.substring(8,10));
	endYear = Number(endDate.substring(0,4));
  } else {
    res.json({error: "Invalid End Date"});
	return;
  }

  jsonR = await getWWOData(wwoQuery); //NOTE fetch all WWOData once per day???
  var begin = new Date(startYear, startMonth-1, startDay);
  var current = new Date(endYear, endMonth-1, endDay);
  var currentDays = Math.round((current.getTime() - begin.getTime()) / oneDay);
  var currentTU = getCurrentTU(startYear, startMonth - 1, startDay, (current.getMonth() + (endYear - startYear) * 12), current.getDate(), jsonR);
  var predict14Days = [];
  if (current < jsonR.data.weather[0].date) {
    predict14Days = get14DaysTUHistory(currentTU, current.getMonth(), jsonR)
  } else {
    predict14Days = get14DaysTU(currentTU, jsonR);
  }
  var pred14DaysVolume = get14DaysAnalysis(predict14Days, 5.9113153, 0.9917134);
  var pred14DaysEmbyro = get14DaysAnalysis(predict14Days, 35.42551, 0.996854183);
  var pred14DaysFirmness = get14DaysAnalysis(predict14Days, 6.00497953, 0.997631460);
  console.log("\nTotal TU: " + totalTU + "\nDays until today: " + currentDays + "\nCurrent TU: " + currentTU + "\nStart Date: " + startDate + "\nEnd Date: " + endDate + "\nStation Name: " + stationName + "\nStation zip: " + zipcode);
  console.log("14 days TU prediction from today:\n" + predict14Days);
  console.log("14 days volume prediction from today:\n" + pred14DaysVolume);
  console.log("14 days embyro prediction from today:\n" + pred14DaysEmbyro);
  console.log("14 days firmness prediction from today:\n" + pred14DaysFirmness);
  res.json({
    currentTU: currentTU,
    TotalTU: totalTU,
    StartDate: startDate,
    resultTable: {
      predict14Days: predict14Days,
      pred14DaysVolume: pred14DaysVolume,
      pred14DaysEmbyro: pred14DaysEmbyro,
      pred14DaysFirmness: pred14DaysFirmness
	}
  });
  return;
};

// axios Http request
// TODO add rejection handler
async function getWWOData(query) {
  let res = await axios.get(query);
  return res.data
}

// Math Functions
function ctof(ctemp) {
  return (ctemp * 9.0 / 5.0 + 32.0);
}

function ftoc(ftemp) {
  return (5.0 / 9.0 * (ftemp - 32.0));
}

function ctotu(ctemp) {
  return (ctemp - 7.0);
}

function getCurrentTU(startYear, startMonth, startDay, currentMonth, currentDay, jsonR) {
  var currentTU = 0;
  for (var i = startMonth; i <= currentMonth; i++) {
    var avgMonthTemp = Math.round(((Number(jsonR.data.ClimateAverages[0].month[i % 12].avgMinTemp) + Number(jsonR.data.ClimateAverages[0].month[i % 12].absMaxTemp)) / 2 - 7) * 100) / 100;
	var monthDays = 0;
	if ((i % 12) == 0 || (i % 12)== 2 || (i % 12) == 4 || (i % 12) == 6 || (i % 12) == 7 || (i % 12) == 9 || (i % 12) == 11) {
      monthDays = 31;
	} else if ((i % 12)== 1 && (startYear % 4 == 0)) {
      monthDays = 29;
	} else if ((i % 12) == 1 && (startYear % 4 != 0)) {
      monthDays = 28;
	} else {
	  monthDays = 30;
	}
	var days = 0;
    if (currentMonth == i) {
      days = currentDay - startDay + 1;
	  currentTU += avgMonthTemp * days;
    } else {
      days = monthDays - startDay;
      currentTU += avgMonthTemp * days;
    }
    startDay = 1;
  }
  return currentTU;
}

function get14DaysTU(currentTU, jsonR) {
  var result = [];
  result.push(Math.round(((Number(jsonR.data.weather[0].mintempC) + Number(jsonR.data.weather[0].maxtempC)) / 2 - 7 + currentTU) * 100) / 100 );
  for (var i = 1; i < 14; i++) {
    result.push(Math.round(((Number(jsonR.data.weather[i].mintempC) + Number(jsonR.data.weather[i].maxtempC)) / 2 - 7 + result[i-1]) * 100) / 100);
  }
  return result;
}

function get14DaysTUHistory(currentTU, currentMonth, jsonR) {
  var result = [];
  result.push(Math.round(((Number(jsonR.data.ClimateAverage[0].month[currentMonth].avgMinTemp) + Number(jsonR.data.ClimateAverages[0].month[currentMonth].absMaxTemp)) / 2 - 7 + currentTU) *100) / 100);
  for (var i = 1; i < 14; i++) {
    result.push(Math.round(((Number(jsonR.data.ClimateAverage[0].month[currentMonth].avgMinTemp) + Number(jsonR.data.ClimateAverages[0].month[currentMonth].absMaxTemp)) / 2 - 7 + result[i-1]) * 100) / 100);
  }
  return result;
}

function get14DaysAnalysis(TU, b2, b3, Asym = 100) {
  var result = [];
  for (var i = 0; i < TU.length; i++) {
    result.push(Math.round(Number((Asym * Math.exp((-b2) * (b3 ** TU[i]))).toFixed(4)) * 100) / 100);
  }
  return result;
}

function wait(ms) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}

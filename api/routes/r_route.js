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

const {exec} = require('child_process'),
  mongoose = require('mongoose'),
  db = mongoose.model('uc_davis_master'),
  http_client = require('../utility/http_client'),
  sleep = require('sleep');

const key = 'd52eb65bdab6a0b0',
  _WorldWeatherOnline_URL = 'http://api.worldweatheronline.com/premium/v1/',
  _WorldWeatherOnline_Key = '2ca2105759cd4590890175217192204',
  oneDay = 86400000;
/*

// Execute local R file
module.exports = function(app) {
  app.get('/r', function(req, res) {
  	exec('./test.r', (err, stdout, stderr) => {
	  if(err) {
	    console.log("Can not execute R script!");
		return;
	  }
	  console.log(`R result:\n${stdout}`);
	  res.json(stdout);
	});
  });
};

*/

module.exports = function(app) {
	app.get('/r', function(req, res) {
		console.log(req.query);
		var startDate =  req.query.startDate;
		var stationName = "No match station found!";
		var zipcode = req.query.zipcode;
		var startMonth = Number(startDate.substring(0,2));
		var startDay = Number(startDate.substring(3,5));
		var startYear = Number(startDate.substring(6,10));
		var endDate = req.query.endDate;
		var endMonth = Number(endDate.substring(0,2));
		var endDay = Number(endDate.substring(3,5));
		var endYear = Number(endDate.substring(6,10));
		var query = _WorldWeatherOnline_URL + 'weather.ashx?key=' + _WorldWeatherOnline_Key + '&q=' + zipcode + '&num_of_days=14&cc=no&tp=24&format=json';
		var totalTU = 0;
		var currentTU = 0;
		console.log("Started");
		db.findOne({zipcode: zipcode}, 'zipcode name max_tu', function (err, station) {
			if (err || station == null) {
				res.send("[ERROR] " + err + " error check failed, station at " + zipcode + " is not recorded in DB");
				return;
			}
			stationName = station.name;
			totalTU = station.max_tu;
			
			http_client.CallbackHttpClient(query, function(response) {
				var jsonR = JSON.parse(response);
				var begin = new Date (startYear, startMonth-1, startDay);
				//var current = new Date (jsonR.data.weather[0].date);
				var current = new Date (endYear, endMonth-1, endDay);
				//console.log(jsonR);
				var currentDays = Math.round((current.getTime() - begin.getTime()) / oneDay);
				var currentTU = getCurrentTU(startMonth - 1, startDay, current.getMonth(), current.getDate(), jsonR);
				console.log(currentTU)
				var predict14Days = [];
				if (current < jsonR.data.weather[0].date) {
					predict14Days = get14DaysTUHistory(currentTU, current.getMonth(), jsonR)
				} else {
					predict14Days = get14DaysTU(currentTU, jsonR);
				}
				var pred14DaysVolume = get14DaysAnalysis(predict14Days, 5.9113153, 0.9917134);
				var pred14DaysEmbyro = get14DaysAnalysis(predict14Days, 35.42551, 0.996854183);
				var pred14DaysFirmness = get14DaysAnalysis(predict14Days, 6.00497953, 0.997631460);
				console.log("\nTotal TU: " + totalTU + ";\nDays until today: " + currentDays + ";\nCurrent TU: " + currentTU + ";\nStart Date: " + startDate + ";\nStation Name: " + stationName + ";\nStation zip: " + zipcode);
				console.log("14 days TU prediction from today:\n" + predict14Days);
				console.log("14 days volume prediction from today:\n" + pred14DaysVolume);
				console.log("14 days embyro prediction from today:\n" + pred14DaysEmbyro);
				console.log("14 days firmness prediction from today:\n" + pred14DaysFirmness);
				var predict14DaysJSON = JSON.stringify(predict14Days);
				var pred14DaysVolumeJSON = JSON.stringify(pred14DaysVolume);
				var pred14DaysEmbyroJSON = JSON.stringify(pred14DaysEmbyro);
				var pred14DaysFirmnessJSON = JSON.stringify(pred14DaysFirmness);
				res.json({
					currentTU: currentTU,
					TotalTU: totalTU,
					StartDate: startDate,
					resultTable: [
						predict14Days,
						pred14DaysVolume,
						pred14DaysEmbyro,
						pred14DaysFirmness]
				});
			});
		});
	});
}

function ctof(ctemp) {
	return (ctemp * 9.0 / 5.0 + 32);
}

function ftoc(ftemp) {
	return (5.0 / 9.0 * (ftemp - 32.0));
}

function ctotu(ctemp) {
	return (ctemp - 7.0);
}

function getCurrentTU(startMonth, startDay, currentMonth, currentDay, jsonR) {
	var currentTU = 0;
	for (var i = startMonth; i <= currentMonth; i++) {
		var avgMonthTemp = Math.round(((Number(jsonR.data.ClimateAverages[0].month[i].avgMinTemp) + Number(jsonR.data.ClimateAverages[0].month[i].absMaxTemp)) / 2 - 7) * 100) / 100;
		var monthDays = 0;
		if (i == 0 || i == 2 || i == 4 || i == 6 || i == 7 || i == 9 || i == 11) {
			monthDays = 31;
		} else if (i == 1 && (startYear % 4 == 0)) {
			monthDays = 29;
		} else if (i == 1 && (startYear % 4 != 0)) {
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
	return result
}

function get14DaysAnalysis(TU, b2, b3, Asym = 100) {
	var result = [];
	for (var i = 0; i < TU.length; i++) {
		result.push(Math.round(Number((Asym * Math.exp((-b2) * (b3 ** TU[i]))).toFixed(4)) * 100) / 100);
	}
	return result;
}

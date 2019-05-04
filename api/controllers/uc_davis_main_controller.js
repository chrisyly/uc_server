'use strict';

const mongoose = require('mongoose'),
  db = mongoose.model('uc_davis_master'), // mongoDB dependency
  axios = require('axios');

const _WorldWeatherOnline_URL = 'http://api.worldweatheronline.com/premium/v1/',
  _WorldWeatherOnline_Key = '2ca2105759cd4590890175217192204',
  oneDay = 86400000;

// ============== Basic api beginning ================= //
exports.get_stations = function(req, res) {
  db.find({}, function(err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};

exports.add_station = function(req, res) {
  var station = new db(req.query);
  console.log(req.query.name);
  station.save(function(err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};

exports.find_station = function(req, res) {
  if (req.params.name) {
    find_by_name(req, res);
  } else if (req.param.zipcode) {
    find_by_zipcode(req, res);
  }
}

function find_by_name(req, res) {
  db.find({name:req.query.name}, function(err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};

function find_by_zipcode(req, res) {
  db.find({zipcode:req.query.zipcode}, function(err, result) {
    if (err)
	  res.send(err);
	res.json(result);
  });
};

exports.update_station = function(req, res) {
  console.log(req.params.stationId)
  console.log(req.body)
  db.findOneAndUpdate({_id: req.params.stationId}, req.body, {new: true}, function(err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};


exports.delete_a_station = function(req, res) {
  db.remove({
    _id: req.params.taskId
  }, function(err, result) {
    if (err)
      res.send(err);
    res.json({ "message": "Task successfully deleted" });
  });
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

  jsonR = await getWWOData(wwoQuery);
  //console.log(startMonth)
  //console.log(startDay)
  //console.log(startYear)
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

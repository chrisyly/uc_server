'use strict';

module.exports = {
	CallbackHttpClient: function(urlQuery, callBack, asyn = true) {
		var XMLHttpRequest = require('xhr2');
		var httpRequest = new XMLHttpRequest();
		httpRequest.onreadystatechange = function() {
			if (httpRequest.readyState == 4 && httpRequest.status == 200) {
				callBack(httpRequest.responseText);
			}
		}
		httpRequest.open("GET", urlQuery, asyn);
		httpRequest.send(null);
	}
/*
	HttpClient: function() {
		this.get = function() {
			var httpRequest = new XMLHttpRequest();
			httpRequest.onreadystatechange = function() {
				if (httpRequest.readyState == 4 && httpRequest.status == 200) {
					return responseText;
				}
			}

			httpRequest.open("GET", urlQuery, true);
			httpRequest.send(null);

		}
	}
*/

/*
	CallbackHttpClient: function() {
		this.get = function(urlQuery, callBack) {
			var httpRequest = new XMLHttpRequest();
			httpRequest.onreadystatechange = function() {
				if (httpRequest.readyState == 4 && httpRequest.status == 200) {
					return callBack(httpRequest.responseText);
				}
			}

			httpRequest.open("GET", urlQuery, true);
			httpRequest.send(null);
		}

		this.put = function(urlQuery, callBack) {
		}
	}
*/
}


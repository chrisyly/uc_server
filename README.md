UC Davis Backend Server
============================
The UC Davis Backend Server is using NodeJS together with mongodb to provide REST API for harvest prediction

API explanation
----------------------------
* Weather API - https://www.worldweatheronline.com/developer/
  * worldweatheronline provide paid services to get world weather data including 14 days predictions and other detailed atomoshpere data
* mongodb API - provide read, write, delete, update functions for database
  * GET: <url>/wudb - get all stored station information
  * POST: <url>/wudb?name=&zipcode=&max_tu= - Add a new station information
  * GET: <url>/wudb/:stationId - get one station information by its _id
  * PUT: <url>/wudb/:stationId?name=&zipcode=&max_tu= - update a station information with the input query information
  * DELETE: <url>/wudb/:stationId - delete a station information from database
* module calculation API
  * GET: <url>/r?startDate=&endDate=&zipcode= - calling the function to calculate prediction
    * [Debug] This API is calling the Weather API to getting the 14 days weather prediction data
    * The input is valid by the front-end
    * The output is a json response and a chart will be generate based on the result

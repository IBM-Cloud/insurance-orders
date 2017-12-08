/*globals cloudantService:true */
/*eslint-env node */
var express = require('express');
var bodyParser = require('body-parser');
var cfenv = require("cfenv");
var path = require('path');
var cors = require('cors');
var appEnv = cfenv.getAppEnv();

// Setup the required environment variables
var vcapLocal = null;
try {
  vcapLocal = require("./vcap-local.json");
}
catch (e) {}

var appEnvOpts = vcapLocal ? {vcap:vcapLocal} : {};
var appEnv = cfenv.getAppEnv(appEnvOpts);

// Setup Cloudant service
var appName;
if (appEnv.isLocal) {
    require('dotenv').load();
}
try {
	cloudantService = appEnv.services.cloudantNoSQLDB[0];
  catalog_url = process.env.CATALOG_URL;
}
catch (e) {
	console.error("Error looking up service: ", e);
}

//Setup middleware.
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'www')));

//REST HTTP Methods
var orders = require('./routes/orders');
app.get('/orders', orders.list);
app.get('/orders/:id', orders.find);
app.post('/orders', orders.create);

// start server on the specified port and binding host
app.listen(appEnv.port, "0.0.0.0", function () {
  // print a message when the server starts listening
  console.log("orders server starting on " + appEnv.url);
});

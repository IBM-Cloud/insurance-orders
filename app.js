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
try {
	cloudantService = appEnv.getService("policy-db");
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

app.listen(appEnv.port, appEnv.bind);
console.log('App started on ' + appEnv.bind + ':' + appEnv.port);


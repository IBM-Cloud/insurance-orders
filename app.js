var express = require('express');
var bodyParser = require('body-parser');
var cfenv = require("cfenv");
var path = require('path');
var cors = require('cors');
var orders = require('./routes/orders');
var appEnv = cfenv.getAppEnv();

//Setup middleware.
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'www')));

//REST HTTP Methods
app.get('/rest/orders', orders.list);
app.get('/rest/orders/:id', orders.find);
app.post('/rest/orders', orders.create);

app.listen(appEnv.port, appEnv.bind);
console.log('App started on ' + appEnv.bind + ':' + appEnv.port);

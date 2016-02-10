var ibmdb = require('ibm_db');
var TABLE_NAME = "OrdersTable";
initDB();

/* clients are responsible for closing the returned connection */
function createConnection(callback) {
	var credentials;
	if (process.env.VCAP_SERVICES) {
		var key = JSON.parse(process.env.VCAP_SERVICES).sqldb;
		if (key) {
			credentials = key[0].credentials;
		}
	}

	if (credentials) {
		var dsnString = "DRIVER={DB2};DATABASE=" + credentials.db + ";UID=" + credentials.username + ";PWD=" + 
			credentials.password + ";HOSTNAME=" + credentials.hostname + ";port=" + credentials.port;
		ibmdb.open(dsnString, function(err, conn) {
			if (err) {
				callback(err);
			} else {
				callback(null, conn);
			}
		});
	} else {
		callback("failed to find database credentials in VCAP_SERVICES");
	}
}

function initDB() {
	createConnection(function(error, connection) {
		if (error) {
			console.log("initDB failed to get a db connection: " + error);
		} else {
			var sqlStatement = "CREATE TABLE " + TABLE_NAME + "(id int not null GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),itemId varchar(64),customerId int,count int)";
			connection.query(sqlStatement, function (err, tables, moreResultSets) {
				connection.close();
			});
		}
	});
}


/* add an order to the database */
exports.create = function(req, res) {
	var itemId = req.body.itemid;
	var customerId = req.body.customerid;
	var count = req.body.count;

	createConnection(function(error, connection) {
		if (error) {
			res.status(500).send({msg: "'create' failed to get a db connection: " + error});			
		} else {
			var sqlStatement = "INSERT INTO " + TABLE_NAME + " (itemId,customerId,count) VALUES ('" + itemId + "'," + customerId + "," + count + ")";
			connection.query(sqlStatement, function (err, tables, moreResultSets) {
				if (err) {
					res.status(500).send({msg: "'create' SQL Error: " + err});
				} else {
					res.status(201).send({msg: 'Successfully created item'});
				}
				connection.close();
			});
		}
	});
};

/* find an order by id */
exports.find = function(req, res) {
	var id = req.params.id;
	createConnection(function(error, connection) {
		if (error) {
			res.status(500).send({msg: "'find' failed to get a db connection: " + error});
		} else {
			var sqlStatement = "SELECT * FROM " + TABLE_NAME + " WHERE id=" + id;
			connection.query(sqlStatement, function (err, tables, moreResultSets) {
				if (err) {
					res.status(500).send({msg: "'find' SQL Error: " + err});
				} else {
					if (tables.length) {
						res.send(JSON.stringify(tables[0]).toLocaleLowerCase());
					} else {
						res.send("");
					}
				}
				connection.close();
			});
		}
	});
};

/* list all orders */
exports.list = function(req, res) {
	createConnection(function(error, connection) {
		if (error) {
			res.status(500).send({msg: "'list' failed to get a db connection: " + error});			
		} else {
			var sqlStatement = "SELECT * FROM " + TABLE_NAME;
			connection.query(sqlStatement, function (err, tables, moreResultSets) {
				if (err) {
					res.status(500).send({msg: "'list' SQL Error: " + err});
				} else {
					var result = "";
					if (!tables.length) {
						result = "No orders logged";
					} else {
						for (var i = 0; i < tables.length;i++) {
							result += JSON.stringify(tables[i]).toLocaleLowerCase() + "<p>";
						}
					}
					res.send(result);
				}
				connection.close();
			});
		}
	});
};

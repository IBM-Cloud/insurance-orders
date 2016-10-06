/*eslint-env node */
/*globals cloudantService catalog_url */
var cloudant = require('cloudant')(cloudantService.credentials.url);
var request = require('request');

console.log("Cloudant is", cloudantService);
console.log("Catalog URL is", catalog_url);

//Initiate the database.
cloudant.db.create('orders', function(err/*, body*/) {
    if (!err) {
        console.log('Successfully created database!');
    } else {
        console.log("Database already exists.");
    }
 });

var ordersDb = cloudant.use('orders');

/* add an order to the database */
exports.create = function(req, res) {
    request.get(catalog_url + '/policies', function (err, response) {
        if (err)
            return res.status(500).send({msg: 'Error on insert, unable to verify order validity: ' + err});

        // Make sure policy with ID exists
        var policies = JSON.parse(response.body).rows,
            validPolicy = false;
        for (var i=0; i < policies.length; i++) {
            if (policies[i].id === req.body.itemid) {
                validPolicy = true;
                break;
            }
        }

        // If invalid policy, return error
        if (!validPolicy)
            return res.status(422).send({msg: 'Order request not completed due to invalid policy ID'});

        // Create order in the DB
        ordersDb.insert(req.body, function(err) {
            if (err){
                res.status(500).send({msg: 'Error on insert, maybe the item already exists: ' + err});
            } else {
                res.status(201).send({msg: 'Successfully created item'});
            }
        });
    });
};


/* find an order by id */
exports.find = function(req, res) {
	var id = req.params.id;
    ordersDb.get(id, { revs_info: false }, function(err, body) {
        if (!err) {
            res.send(body);
        } else {
            res.send({msg:'Error: could not find item: ' + id});
        }
    });
};

/* list all orders */
exports.list = function(req, res) {
	ordersDb.list({include_docs: true}, function(err, body/*, headers*/) {
    if (!err) {
        res.send(body);
        return;
    }
   	res.status(500).send({msg:'Error listing orders: ' + err});
	});
};

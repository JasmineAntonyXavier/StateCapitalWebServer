const express = require('express');
const app = express();

var bodyparser = require('body-parser');
var mysql = require('mysql');

app.use(bodyparser.urlencoded({
    extended: false
}));
app.use(bodyparser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'states'
});

connection.connect(function(err) {
    if (err) throw err
    console.log('you are now connected.....');
})
//getting state_name, capital_name, latitude and longitude data from database
app.get('/states', function(req, res, next) {
    var name = req.query.name;
    var sql = "select s.state_name,c.capital_name, c.latitude, c.longitude from state_capital_link As scl join state As s on scl.state_id = s.state_id  join capital As c on scl.capital_id = c.capital_id ";
    if (name != null) {
        var sql = "select s.state_name,c.capital_name, c.latitude, c.longitude from state_capital_link As scl join state As s on scl.state_id = s.state_id  join capital As c on scl.capital_id = c.capital_id where state_name like '" + name + "%'"
    }
    connection.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});
// Adding data into database 
app.post('/states', function(req, res, next) {
    var state_name = req.body.state_name;
    var capital_name = req.body.capital_name;
    var latitude = parseFloat(req.body.latitude);
    var longitude = parseFloat(req.body.longitude);
    InsertInformation(state_name, capital_name, latitude, longitude);
    res.send('Post Complete');
});

app.listen(1000, () => console.log('State app is running on port 1000'));

// insert data into database using Transaction scope
function InsertInformation(state_name, capital_name, latitude, longitude) {
    connection.beginTransaction(function(err) {
        if (err) {
            throw err;
        }

        var capitalQuery = "insert into capital(capital_name, latitude, longitude) values('" + capital_name + "', " + latitude + ", " + longitude + ")";
        connection.query(capitalQuery, function(err, result) {
            if (err) {
                return connection.rollback(function() {
                    throw error;
                });
            }
            var capital_id = result.insertId;
            var stateQuery = "insert into state(state_name) values('" + state_name + "')";
            connection.query(stateQuery, function(err, result) {
                if (err) {
                    throw err;
                }
                var state_id = result.insertId;
                var linkQuery = "insert into state_capital_link(state_id, capital_id) values(" + state_id + ", " + capital_id + ")";
                connection.query(linkQuery, function(err, result) {
                    if (err) {
                        throw err;
                    }
                });

                connection.commit(function(err) {
                    if (err) {
                        connection.rollback(function() {
                            throw err;
                        });
                    }
                });
            });
        });
    });
}
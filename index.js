const express = require('express');
const app = express();

var bodyparser = require('body-parser');
var mysql = require('mysql');

app.use(bodyparser.urlencoded({ extended : false }));
app.use(bodyparser.json());

var connection = mysql.createConnection({
 host : 'localhost',
 user : 'root',
 password : 'root',
 database : 'states'
 });
 
 connection.connect(function(err){
 if(err) throw err
 console.log('you are now connected.....');
 })
 
 app.get('/states', function(req, res){
   var query = "select state_name, capital_name from capital";
   connection.query(query, function(err, result){
     if(err){
	      throw err;
	 }
	 res.send(result);
   });
 });
 
  app.get('/states/:name', function(req, res){
	  var name = req.params.name;
      var query = "select state_name,capital_name from capital where state_name = ";
	  var sql = query.concat(name);
	  console.log(sql);
   connection.query(sql, function(err, result){
     if(err){
	      throw err;
	 }
	 res.send(result);
   });
 });
 
 app.post('/states', function(req, res){
	 var state_name = req.body.state_name;
	 var capital_name = req.body.capital_name;
	 var query = "insert into capital(state_name, capital_name) values('"+state_name+"', '"+capital_name+"')";
	 console.log(query);
	 connection.query(query, function(err, result){
		 if(err){
			 throw err;
		 }
		 console.log("1 row inserted ");
		 res.send("posted successfully")
	 });
	 
	 
 });
 
 app.listen(1000, () => console.log('State app is running on port 1000'));
 
 
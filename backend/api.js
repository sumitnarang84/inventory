var express = require('express');
var http = require('http');
const bodyParser = require('body-parser')
const db = require('./db');
var md5 = require('md5');
var app = express();

const hostname = 'localhost';
const port = 8080;

app.use(
  bodyParser.urlencoded({
    extended: true
  })
)

app.use(bodyParser.json())
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/login', function (req, res) {
  username = req.body.username
  password  = req.body.password
  if (username == null || password == null) {
  		res.statusCode = 500;
      res.end( JSON.stringify({"error" : "Please provide username and password"}));
      return;
  }

  db.getConnection().query("Select * from users where username='"+username+"' and password = '"+md5(password)+"'", function (err, result) {
    if (err) throw err;
    if (result == "") {
    		res.statusCode = 401;
        res.end(JSON.stringify({"error" : "Invalid Credentials"}));
        return;
    	}
      
    	res.statusCode = 200;
    	res.end(JSON.stringify({"success" : "Congratulations!, You are logged in", "id" : result[0].id}));
  });
})

app.get('/products', function (req, res) {
    db.getConnection().query("Select * from products", function(err, result) {
      if (err) throw err;
      var products = [];
      for (var i = 0;i < result.length; i++) {
        products.push({id: result[i].id, name: result[i].name, description: result[i].description});
      }
      res.statusCode = 200;
      res.end(JSON.stringify(products));

    });
  });

  app.get('/products/:id', function (req, res) {
    db.getConnection().query("Select * from products where id=" + req.params.id, function(err, result) {
      if (err) throw err;
      var products = [];
      if (result.length > 0) {
        product = {id: result[0].id, name: result[0].name, description: result[0].description};
      }
      
      res.statusCode = 200;
      res.end(JSON.stringify(product));

    });
  });
  

app.listen(8080, function () {
   console.log("Example app listening at http://%s:%s", hostname, port)
})


//https://codereview.stackexchange.com/questions/120331/passing-node-js-sql-connection-to-multiple-routes
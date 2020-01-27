var express = require('express');
var http = require('http');
const bodyParser = require('body-parser')
const db = require('./db');
var md5 = require('md5');
var jwt = require('jsonwebtoken');
var app = express();
const secret = "smUQ0VWqsm";

const hostname = 'localhost';
const port = 8080;

app.use(
  bodyParser.urlencoded({
    extended: true
  })
)

app.use(bodyParser.json())
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:4200"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.post('/login', function (req, res) {
  username = req.body.username
  password = req.body.password
  
  if (username == null || password == null) {
  		res.statusCode = 500;
      res.end( JSON.stringify({"error" : "Please provide username and password"}));
      return;
  }

  db.getConnection().query("Select * from users where username='"+username+"' and password = '"+md5(password)+"'", function (err, result) {
    if (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({"error" : err}));
        return;
    }

    if (result == "") {
    		res.statusCode = 401;
        res.end(JSON.stringify({"error" : "Invalid Credentials"}));
        return;
    	}
      
      res.statusCode = 200;
      var token = jwt.sign({ "id" : result[0].id } , secret);
    	res.end(JSON.stringify({"success" : "Congratulations!, You are logged in", "id" : result[0].id, "access_token" : token}));
  });
})

app.get('/products', function (req, res) {
    if (req.headers.authorization == null) {
      res.statusCode = 403;
      res.end(JSON.stringify({"error" : "UnAuthorized Request"}));
    }

    token = req.headers.authorization;
    try {
      var decoded = jwt.verify(token, secret);
    } catch(err) {
      res.statusCode = 403;
      res.end(JSON.stringify({"error" : "UnAuthorized Request"}));
    }

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
      if (req.headers.authorization == null) {
        res.statusCode = 403;
        res.end(JSON.stringify({"error" : "UnAuthorized Request"}));
      }

      token = req.headers.authorization;
      try {
        var decoded = jwt.verify(token, secret);
      } catch(err) {
        res.statusCode = 403;
        res.end(JSON.stringify({"error" : "UnAuthorized Request"}));
      }

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
  
  app.post('/products/', function (req, res) {
    if (req.headers.authorization == null) {
      res.statusCode = 403;
      res.end(JSON.stringify({"error" : "UnAuthorized Request"}));
    }

    token = req.headers.authorization;
    try {
      var decoded = jwt.verify(token, secret);
    } catch(err) {
      res.statusCode = 403;
      res.end(JSON.stringify({"error" : "UnAuthorized Request"}));
    }

    name = req.body.name;
    description = req.body.description;

    db.getConnection().query("Insert into products (name, description) values('"+ name +"', '"+ description +"')", function (err, result) {
      if (err) throw err;

      res.statusCode = 200;
      res.end(JSON.stringify({"id" : result.insertId, "success" : "New Product added"}));
    });

});   

app.listen(8080, function () {
   console.log("Example app listening at http://%s:%s", hostname, port)
});
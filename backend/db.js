var mysql = require('mysql');
var connection;


module.exports.getConnection = function () {
	 if (!connection) {
        connection = mysql.createConnection({
  			host: "localhost",
 			user: "root",
  			password: "secret",
  			database : "inventory"
		});

        connection.connect(function(err){
            if(!err) {
                console.log('Database is connected!');
            } else {
                console.log('Error connecting database!');
            }
        });
    }
    return connection;
}



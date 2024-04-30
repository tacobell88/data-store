const mysql = require("mysql2");

const con = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "admin",
  database: "assignment1",
});

module.exports = con.promise();

const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "nodejs-course",
  password: "6097278",
});

module.exports = pool.promise();

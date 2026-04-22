const Sequelize = require("sequelize");

const sequelize = new Sequelize("nodejs-course", "root", "6097278", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;

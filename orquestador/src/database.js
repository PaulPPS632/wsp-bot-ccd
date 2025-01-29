const { Sequelize } = require("sequelize");

// Configuración de la conexión a la base de datos
const sequelize = new Sequelize("bots_db", "paul", "paulp", {
  host: "localhost",
  dialect: "mysql", // Cambia a "postgres", "sqlite", o el dialecto que uses
});

module.exports = sequelize;

const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Bot = sequelize.define("Bot", {
  containerId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  port: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pairingCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

module.exports = Bot;

const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const BotQueue = sequelize.define("BotQueue", {
  botId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Cada bot tiene una cola única
  },
  containerId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  queueName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

module.exports = BotQueue;

const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Base = sequelize.define("Base", {
  number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
});

module.exports = Base;

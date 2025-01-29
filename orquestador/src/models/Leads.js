const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Leads = sequelize.define("Leads", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  flow: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  respuesta: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
});

module.exports = Leads;

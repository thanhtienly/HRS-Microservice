const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/config");

const Staff = sequelize.define(
  "Staff",
  {
    staffId: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "staffs",
    timestamps: false,
  }
);

module.exports = { Staff };

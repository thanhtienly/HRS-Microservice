const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/config");

const CheckIn = sequelize.define(
  "CheckIn",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    roomId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    studentId: {
      type: DataTypes.CHAR(10),
      allowNull: true,
    },
    managerId: {
      type: DataTypes.CHAR(10),
      allowNull: true,
    },
    staffId: {
      type: DataTypes.CHAR(10),
      allowNull: true,
    },
    checkedInAt: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    tableName: "check_ins",
    timestamps: false,
  }
);

module.exports = { CheckIn };

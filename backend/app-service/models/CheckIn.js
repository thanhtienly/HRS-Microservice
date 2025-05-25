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
    reservationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    studentId: {
      type: DataTypes.CHAR(10),
      allowNull: false,
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

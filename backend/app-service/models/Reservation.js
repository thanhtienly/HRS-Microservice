const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/config");

const Reservation = sequelize.define(
  "Reservation",
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
      allowNull: false,
    },
    from: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    to: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    reservedAt: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    secret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.ENUM(["Booked", "Cancelled", "Check-In", "Expired"]),
      allowNull: false,
    },
  },
  {
    tableName: "reservations",
    timestamps: false,
  }
);

module.exports = { Reservation };

const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/config");

const RepairSchedule = sequelize.define(
  "RepairSchedule",
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
    staffId: {
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
    scheduledAt: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    tableName: "repair_schedules",
    timestamps: false,
  }
);

module.exports = { RepairSchedule };

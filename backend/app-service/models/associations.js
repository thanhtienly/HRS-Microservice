const { CheckIn } = require("./CheckIn");
const { Feedback } = require("./Feedback");
const { RepairSchedule } = require("./RepairSchedule");
const { Reservation } = require("./Reservation");
const { Room } = require("./Room");
const { SelfStudyArea } = require("./SelfStudyArea");

CheckIn.belongsTo(Room, {
  foreignKey: "roomId",
});

Room.belongsTo(SelfStudyArea, {
  foreignKey: "ssaId",
});

Reservation.belongsTo(Room, {
  foreignKey: "roomId",
});

Feedback.belongsTo(Room, {
  foreignKey: "roomId",
});

RepairSchedule.belongsTo(Room, {
  foreignKey: "roomId",
});

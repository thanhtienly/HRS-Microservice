const { CheckIn } = require("../models/CheckIn");
const { v4: uuidv4 } = require("uuid");

const createCheckIn = async ({ roomId, reservationId, studentId }) => {
  return await CheckIn.create({
    id: uuidv4(),
    roomId: roomId,
    reservationId: reservationId,
    studentId: studentId,
    checkedInAt: new Date().getTime(),
  });
};

module.exports = { createCheckIn };

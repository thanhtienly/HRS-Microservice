const { Reservation } = require("../models/Reservation");
const { Room } = require("../models/Room");
const { SelfStudyArea } = require("../models/SelfStudyArea");

async function seed() {
  await SelfStudyArea.create({
    id: "1",
    building: "H6",
    floor: "1",
  });

  await Room.bulkCreate([
    {
      id: "1",
      ssaId: "1",
      name: "H6-101",
      capacity: 4,
      type: "Mentoring",
      floor: "1",
    },
    {
      id: "2",
      ssaId: "1",
      name: "H6-102",
      capacity: 10,
      type: "Group",
      floor: "1",
    },
    {
      id: "3",
      ssaId: "1",
      name: "H6-103",
      capacity: 1,
      type: "Individual",
      floor: "1",
    },
  ]);

  await Reservation.bulkCreate([
    {
      id: "1",
      roomId: "1",
      studentId: "2212345",
      from: new Date().getTime() + 24 * 60 * 60 * 1000,
      to: new Date().getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
      reservedAt: new Date().getTime(),
      secret: "secret1",
    },
    {
      id: "2",
      roomId: "2",
      studentId: "2212345",
      from: new Date().getTime() + 24 * 60 * 60 * 1000,
      to: new Date().getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
      reservedAt: new Date().getTime(),
      secret: "secret2",
    },
    {
      id: "3",
      roomId: "3",
      studentId: "2212345",
      from: new Date().getTime() + 24 * 60 * 60 * 1000,
      to: new Date().getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
      reservedAt: new Date().getTime(),
      secret: "secret3",
    },

    {
      id: "4",
      roomId: "1",
      studentId: "2256789",
      from: new Date().getTime() - 24 * 60 * 60 * 1000,
      to: new Date().getTime() - 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
      reservedAt: new Date().getTime() - 2 * 24 * 60 * 60 * 1000,
      secret: "secret4",
    },
    {
      id: "5",
      roomId: "2",
      studentId: "2256789",
      from: new Date().getTime() - 24 * 60 * 60 * 1000,
      to: new Date().getTime() - 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
      reservedAt: new Date().getTime() - 2 * 24 * 60 * 60 * 1000,
      secret: "secret5",
    },
    {
      id: "6",
      roomId: "3",
      studentId: "2256789",
      from: new Date().getTime() - 24 * 60 * 60 * 1000,
      to: new Date().getTime() - 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
      reservedAt: new Date().getTime() - 2 * 24 * 60 * 60 * 1000,
      secret: "secret6",
    },
  ]);
}

module.exports = { seed };

const { Reservation } = require("../models/Reservation");
const { Room } = require("../models/Room");
const { SelfStudyArea } = require("../models/SelfStudyArea");

const getBookingHistoryByStudentId = async ({ studentId }) => {
  var reservationList = await Reservation.findAll({
    where: {
      studentId,
    },
    include: [
      {
        model: Room,
        include: [
          {
            model: SelfStudyArea,
          },
        ],
      },
    ],
  });

  reservationList = reservationList.map((reservation) => {
    return {
      id: reservation.id,
      roomId: reservation.roomId,
      studentId: reservation.studentId,
      from: reservation.from,
      to: reservation.to,
      reservedAt: reservation.reservedAt,
      state: reservation.state,
      secret: reservation.secret,
      roomName: reservation.Room?.name,
      roomCapacity: reservation.Room?.capacity,
      roomType: reservation.Room?.type,
      ssaName: reservation.Room?.SelfStudyArea?.building,
    };
  });

  return reservationList;
};

module.exports = { getBookingHistoryByStudentId };

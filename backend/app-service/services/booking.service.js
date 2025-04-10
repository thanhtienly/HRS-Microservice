const { Reservation } = require("../models/Reservation");
const { Room } = require("../models/Room");
const { SelfStudyArea } = require("../models/SelfStudyArea");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const { generateKeySync } = require("crypto");

const findReservationDetailById = async (id) => {
  var reservation = await Reservation.findOne({
    where: {
      id,
    },
    include: [
      {
        model: Room,
      },
    ],
  });

  if (!reservation) {
    return reservation;
  }

  reservation = {
    id: reservation.id,
    roomId: reservation.roomId,
    studentId: reservation.studentId,
    from: reservation.from,
    to: reservation.to,
    reservedAt: reservation.reservedAt,
    secret: reservation.secret,
    state: reservation.state,
    roomName: reservation.Room?.name,
    roomCapacity: reservation.Room?.capacity,
    roomType: reservation.Room?.type,
    roomFloor: reservation.Room?.floor,
  };
  return reservation;
};

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
      roomFloor: reservation.Room?.floor,
      ssaName: reservation.Room?.SelfStudyArea?.building,
    };
  });

  return reservationList;
};
const findBookedTimeSlot = async ({ roomId, date }) => {
  var startOfSearchDate = new Date(new Date(date).setHours(0, 0, 0)).getTime();
  var endOfSearchDate = new Date(new Date(date).setHours(23, 59, 59)).getTime();

  return await Reservation.findAll({
    where: {
      [Op.and]: [
        { roomId: roomId },
        {
          state: "Booked",
        },
        {
          from: {
            [Op.gte]: startOfSearchDate,
          },
        },
        {
          to: {
            [Op.lte]: endOfSearchDate,
          },
        },
      ],
    },
    attributes: ["from", "to"],
    order: [["from", "ASC"]],
  });
};

const findOverlapTimeSlot = async ({ roomId, startTime, endTime }) => {
  /* Note that: (08:00 -> 09:00) is not overlap with (09:00 -> 10:00) */
  return await Reservation.findAll({
    where: {
      [Op.and]: [
        { roomId },
        {
          state: "Booked",
        },
        {
          [Op.or]: [
            {
              /*
               * Exist reservation (08:00 -> 09:00), new booking (07:30 -> ...)
               * startTime of exist in (startTime -> endTime) of new booking -> reject
               */
              [Op.and]: [
                {
                  from: {
                    [Op.gte]: startTime,
                  },
                },
                {
                  from: {
                    [Op.lt]: endTime,
                  },
                },
              ],
            },
            {
              /*
               * Exist reservation (08:00 -> 09:00), new booking (08:30 -> ...)
               * endTime of exist in (startTime -> endTime) of new booking -> reject
               */
              [Op.and]: [
                {
                  to: {
                    [Op.gt]: startTime,
                  },
                },
                {
                  to: {
                    [Op.lte]: endTime,
                  },
                },
              ],
            },
            {
              /*
               * Exist reservation (08:00 -> 09:00), new booking (07:30 -> 09:30)
               * exist reservation range is subRange of new booking range -> reject
               */
              [Op.and]: [
                {
                  from: {
                    [Op.lte]: startTime,
                  },
                },
                {
                  to: {
                    [Op.gte]: endTime,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    limit: 1,
  });
};

const createReservation = async ({
  roomId,
  studentId,
  startTime,
  endTime,
  secret,
}) => {
  var reservation = await Reservation.create({
    id: uuidv4(),
    roomId: roomId,
    studentId: studentId,
    from: startTime,
    to: endTime,
    reservedAt: new Date().getTime(),
    secret:
      secret ||
      generateKeySync("hmac", {
        length: parseInt(process.env.RESERVATION_SECRET_BYTE_LENGTH),
      })
        .export()
        .toString("hex"),
    state: "Booked",
  });
  return reservation;
};

const findAllReservationBySecret = async (secret) => {
  return await Reservation.findAll({
    where: {
      secret,
    },
  });
};

module.exports = {
  findReservationDetailById,
  getBookingHistoryByStudentId,
  findBookedTimeSlot,
  findOverlapTimeSlot,
  createReservation,
  findAllReservationBySecret,
};

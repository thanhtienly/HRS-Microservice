require("dotenv").config();
const {
  getBookingHistoryByStudentId,
  findBookedTimeSlot,
  findOverlapTimeSlot,
  createReservation,
  findReservationDetailById,
  findAllReservationBySecret,
} = require("../services/booking.service");
const jwt = require("jsonwebtoken");
const client = require("../services/client.service");
const { Reservation } = require("../models/Reservation");
const {
  convertToUTC7Full,
  convertTimeStampToDate,
  convertTimestampToHHMM,
} = require("../utils/date");

const getRoomReservedCount = async (req, res) => {
  const roomId = req.query?.roomId;

  if (!roomId) {
    return res.status(404).json({
      success: false,
      message: "RoomId not found",
    });
  }

  const totalReserved = await Reservation.count({
    where: {
      roomId: roomId,
    },
  });

  res.json({
    success: true,
    data: totalReserved,
  });
};

const getBookingHistory = async (req, res) => {
  var user = req.headers?.user;

  /* This request don't have auth info */
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorization the request",
    });
  }

  user = JSON.parse(user);

  var reservationList = await getBookingHistoryByStudentId({
    studentId: user.studentId,
  });

  /* Convert timestamp type of number to date with format YYYY-MM-DD hh:mm:ss */
  reservationList = reservationList.map((reservation) => {
    return {
      id: reservation.id,
      roomId: reservation.roomId,
      studentId: reservation.studentId,
      from: convertToUTC7Full(reservation.from),
      to: convertToUTC7Full(reservation.to),
      reservedAt: convertToUTC7Full(reservation.reservedAt),
      state: reservation.state,
      secret: reservation.secret,
      roomName: reservation.roomName,
      roomCapacity: reservation.roomCapacity,
      roomType: reservation.roomType,
      ssaName: reservation.ssaName,
    };
  });

  res.json({
    success: true,
    data: reservationList,
  });
};

const getTimeSlot = async (req, res) => {
  console.log("App service receive request");
  const { date, roomId } = req.query;

  const TIME_SLOT_IN_MINUTE = parseInt(process.env.TIME_SLOT_IN_MINUTE);
  const SERVICE_START_HOUR = parseInt(process.env.SERVICE_START_HOUR);
  const SERVICE_END_HOUR = parseInt(process.env.SERVICE_END_HOUR);
  const SERVICE_TIMEZONE = parseInt(process.env.SERVICE_TIMEZONE);

  /* Check if the search date is not before today  */
  var startOfToday = new Date(new Date().setHours(SERVICE_START_HOUR, 0, 0));
  if (new Date(date).getTime() < startOfToday.getTime()) {
    return res.status(400).json({
      success: false,
      message: "Search date can't be yesterday",
    });
  }

  var timeSlotList = [];

  var startOfSearchDay = new Date(
    new Date(date).setUTCHours(SERVICE_START_HOUR - SERVICE_TIMEZONE, 0, 0)
  ).getTime();
  console.log(startOfSearchDay);
  for (let i = SERVICE_START_HOUR; i <= SERVICE_END_HOUR; i++) {
    var timeSlotIndex = i - SERVICE_START_HOUR;

    timeSlotList.push({
      date: date,
      startTime: convertTimestampToHHMM(
        startOfSearchDay + timeSlotIndex * TIME_SLOT_IN_MINUTE * 60 * 1000
      ),
      endTime: convertTimestampToHHMM(
        startOfSearchDay + (timeSlotIndex + 1) * TIME_SLOT_IN_MINUTE * 60 * 1000
      ),
      status: "available",
    });
  }

  /* Find all timeSlot's booked by other student */
  var bookedTimeSlot = await findBookedTimeSlot({ roomId, date });

  for (let i = 0; i < bookedTimeSlot.length; i++) {
    var timeSlotIndex =
      (bookedTimeSlot[i].from - startOfSearchDay) /
      (TIME_SLOT_IN_MINUTE * 60 * 1000);

    if (timeSlotIndex >= 0) {
      timeSlotList[timeSlotIndex].status = "booked";
    }
  }

  res.json({
    success: true,
    data: timeSlotList,
  });
};

const bookTimeSlot = async (req, res) => {
  var user = req.headers?.user;

  /* This request don't have auth info */
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorization the request",
    });
  }

  user = JSON.parse(user);

  var { date, roomId, timeSlot } = req.body;
  timeSlot = timeSlot.map((item) => {
    return item.split(/\s-\s/);
  });

  /* Check if at least 1 time slot overlap */
  for (let i = 0; i < timeSlot.length; i++) {
    var startTime = new Date(`${date}T${timeSlot[i][0]}:00+07:00`).getTime();
    var endTime = new Date(`${date}T${timeSlot[i][1]}:00+07:00`).getTime();

    /* Invalid startTime constraint */
    if (startTime < new Date().getTime()) {
      return res.status(400).json({
        success: false,
        message: `Invalid datetime`,
      });
    }

    /* Invalid time slot
     * start time or end time is not format at hh:00
     * time slot lasts more than 1 hour
     */
    const TIME_SLOT_IN_MILLISECOND =
      parseInt(process.env.TIME_SLOT_IN_MINUTE) * 60 * 1000;

    if (
      startTime % TIME_SLOT_IN_MILLISECOND != 0 ||
      endTime % TIME_SLOT_IN_MILLISECOND != 0 ||
      endTime - startTime != TIME_SLOT_IN_MILLISECOND
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid time slot",
      });
    }

    var overLapBooked = await findOverlapTimeSlot({
      roomId,
      startTime,
      endTime,
    });

    /* This booking overlaps with exist booking */
    if (overLapBooked.length != 0) {
      return res.status(400).json({
        success: false,
        message: `Overlap booking`,
      });
    }
  }

  try {
    const studentId = user["studentId"];
    var reservationList = [];

    for (let i = 0; i < timeSlot.length; i++) {
      var reservation = await createReservation({
        roomId: roomId,
        studentId: studentId,
        startTime: new Date(`${date}T${timeSlot[i][0]}:00+07:00`).getTime(),
        endTime: new Date(`${date}T${timeSlot[i][1]}:00+07:00`).getTime(),
      });

      reservationList.push({
        id: reservation["id"],
        roomId: reservation["roomId"],
        studentId: reservation["studentId"],
        from: reservation["from"],
        to: reservation["to"],
        reservedAt: reservation["reservedAt"],
        state: reservation["state"],
      });
    }

    res.json({
      success: true,
      data: reservationList,
    });
  } catch (error) {
    console.log("Error with create reservation");
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error when creating the booking",
    });
  }
};

const createInvitation = async (req, res) => {
  var user = req.headers?.user;

  /* This request don't have auth info */
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorization the request",
    });
  }

  user = JSON.parse(user);
  const studentId = user.studentId;

  const { reservationId, participants } = req.body;

  const reservation = await findReservationDetailById(reservationId);

  /* Invalid reservation id */
  if (!reservation) {
    return res
      .status(404)
      .json({ success: false, message: "Reservation not found" });
  }

  if (studentId != reservation.studentId) {
    return res.status(401).json({
      success: false,
      message: "You're not owner of this reservation",
    });
  }

  if (reservation.roomType == "Individual") {
    return res.status(400).json({
      success: false,
      message: "Individual Room can't invite other people",
    });
  }

  const roomCapacity = reservation.roomCapacity;
  var roomReservationList = await findAllReservationBySecret(
    reservation["secret"]
  );

  if (roomCapacity - roomReservationList.length < participants.length) {
    return res.status(400).json({
      success: false,
      message: "Invalid number of invited participants",
    });
  }

  const date = convertTimeStampToDate(reservation["from"]);
  const startTime = convertTimestampToHHMM(reservation["from"]);
  const endTime = convertTimestampToHHMM(reservation["to"]);
  const inviterName = user.firstName + " " + user.lastName;

  var invitation = {
    participants: participants,
    roomName: reservation.roomName,
    roomType: reservation.roomType,
    secret: reservation.secret,
    date: date,
    startTime: startTime,
    endTime: endTime,
    inviterName: inviterName,
  };

  res.json({
    success: true,
    data: invitation,
  });
};

const acceptInvitation = async (req, res) => {
  const token = req.query?.token;

  if (!token) {
    return res.status(404).json({
      success: false,
      message: "Token can't empty",
    });
  }

  jwt.verify(token, process.env.JWT_TOKEN_SECRET, {}, async (err, payload) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid Token",
      });
    }

    /* Call Auth Service to check if any student with this email */
    const response = await client.post(
      `${process.env.AUTH_SERVICE_HOST}/auth/student/find-by-email`,
      {
        email: payload.email,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "correlation-id": req.headers["correlation-id"],
        },
      }
    );

    /* Can't find student */
    if (!response.success) {
      return res.status(response.status).json({
        success: response.success,
        data: response?.data,
        message: response?.message,
      });
    }

    /* Found student with the provide email */
    const student = response.data;

    /* Valid Token with payload contain email, secret of the room */
    const reservationList = await findAllReservationBySecret(payload.secret);

    if (reservationList.length == 0) {
      return res.status(404).json({
        success: false,
        message: "Invalid secret",
      });
    }

    /* Check if this student accept the invitation before or not */
    var isJoin = false;

    reservationList.forEach((reservation) => {
      if (reservation.studentId == student.studentId) {
        isJoin = true;
      }
    });

    if (isJoin) {
      return res.status(403).json({
        success: false,
        message: "Duplicate joining",
      });
    }

    const reservationDetail = await findReservationDetailById(
      reservationList[0]["id"]
    );
    const roomCapacity = reservationDetail.roomCapacity;

    /* Room is full */
    if (reservationList.length == roomCapacity) {
      return res.status(400).json({
        success: false,
        message: "The room's full",
      });
    }

    try {
      const newReservation = await createReservation({
        roomId: reservationDetail.roomId,
        studentId: student.studentId,
        startTime: reservationDetail.from,
        endTime: reservationDetail.to,
        secret: reservationDetail.secret,
      });

      return res.json({
        success: true,
        data: newReservation,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error. Accept invitation failed",
      });
    }
  });
};

module.exports = {
  getRoomReservedCount,
  getBookingHistory,
  getTimeSlot,
  bookTimeSlot,
  createInvitation,
  acceptInvitation,
};

require("dotenv").config();
const {
  getBookingHistoryByStudentId,
  findBookedTimeSlot,
  findOverlapTimeSlot,
  findOverlapTimeSlotOfStudent,
  createReservation,
  findReservationDetailById,
  findAllReservationBySecret,
  updateReservationState,
} = require("../services/booking.service");
const jwt = require("jsonwebtoken");
const client = require("../services/client.service");
const { createCheckIn } = require("../services/checkin.service");
const { Reservation } = require("../models/Reservation");

const {
  convertToUTC7Full,
  convertTimeStampToDate,
  convertTimestampToHHMM,
} = require("../utils/date");

const reservationState = {
  booked: "Booked",
  cancel: "Cancelled",
  waiting: "Waiting",
};

const bookingHistoryCategory = {
  upcoming: "incoming",
  past: "past",
};

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
  const category = req.query?.category || bookingHistoryCategory.upcoming;

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

  if (category == bookingHistoryCategory.upcoming) {
    /* Get upcoming booking */
    reservationList = reservationList.filter(
      (reservation) =>
        reservation.state == reservationState.booked &&
        reservation.to > new Date().getTime()
    );
  } else {
    reservationList = reservationList.filter(
      (reservation) =>
        reservation.state != reservationState.booked ||
        reservation.to < new Date().getTime()
    );
  }

  /* Convert timestamp type of number to date with format YYYY-MM-DD hh:mm:ss */
  reservationList = reservationList.map((reservation) => {
    return {
      id: reservation.id,
      roomId: reservation.roomId,
      studentId: reservation.studentId,
      date: convertTimeStampToDate(reservation.from),
      from: convertTimestampToHHMM(reservation.from),
      to: convertTimestampToHHMM(reservation.to),
      reservedAt: convertToUTC7Full(reservation.reservedAt),
      secret: reservation.secret,
      state: reservation.state,
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
  const { date, roomId } = req.query;

  const TIME_SLOT_IN_MINUTE = parseInt(process.env.TIME_SLOT_IN_MINUTE);
  const SERVICE_START_HOUR = parseInt(process.env.SERVICE_START_HOUR);
  const SERVICE_END_HOUR = parseInt(process.env.SERVICE_END_HOUR);
  const SERVICE_TIMEZONE = parseInt(process.env.SERVICE_TIMEZONE);

  var startOfToday = new Date(
    new Date().setHours(SERVICE_START_HOUR - SERVICE_TIMEZONE, 0, 0, 0)
  );
  var startOfSearchDay = new Date(
    new Date(date).setUTCHours(SERVICE_START_HOUR - SERVICE_TIMEZONE, 0, 0, 0)
  ).getTime();

  /* Check if the search date is not before today  */
  if (startOfSearchDay < startOfToday.getTime()) {
    return res.status(400).json({
      success: false,
      message: "Search date can't be yesterday",
    });
  }

  var timeSlotList = [];

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

    /* Current time is later than endTime */
    if (endTime <= new Date().getTime()) {
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
    if (overLapBooked) {
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

const checkInTimeSlot = async (req, res) => {
  var user = req.headers?.user;
  user = JSON.parse(user);
  var { date, roomId, timeSlot } = req.body;

  /* Split time slot from format: "08:00 - 09:00" to ["08:00", "09:00"]  */
  timeSlot = timeSlot.split(/\s-\s/);

  var startTime = new Date(`${date}T${timeSlot[0]}:00+07:00`).getTime();
  var endTime = new Date(`${date}T${timeSlot[1]}:00+07:00`).getTime();

  const reservation = await findOverlapTimeSlotOfStudent({
    roomId: roomId,
    startTime: startTime,
    endTime: endTime,
    studentId: user.studentId,
  });

  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: "Reservation not found",
    });
  }

  if (reservation.state == "Cancelled") {
    return res.status(400).json({
      success: false,
      message: "Your reservation have been cancelled",
    });
  }

  if (reservation.state == reservationState.waiting) {
    return res.status(400).json({
      success: false,
      message: "Please accept invitation, then check-in again",
    });
  }

  const checkedIn = await createCheckIn({
    roomId: reservation.roomId,
    reservationId: reservation.id,
    studentId: user.studentId,
  });

  res.json({
    success: true,
    data: checkedIn,
  });
};

const findParticipants = async (req, res) => {
  const { secret } = req.body;

  let participants = [];
  const reservationList = await findAllReservationBySecret(secret);

  for (let i = 0; i < reservationList.length; i++) {
    /* Call Auth Service to check if any student with this email */
    const response = await client.post(
      `${process.env.AUTH_SERVICE_HOST}/auth/student/find-by-student-id`,
      {
        studentId: reservationList[i].studentId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "correlation-id": req.headers["correlation-id"],
        },
      }
    );

    /* Student exist */
    if (response.success) {
      const student = response.data;
      participants.push({
        ...student,
        state: reservationList[i].state,
      });
    }
  }

  res.json({
    success: true,
    data: participants,
  });
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

  roomReservationList = roomReservationList.map((item) => {
    return item.studentId;
  });

  var studentIdList = participants.map((item) => item.studentId);

  /* Remove duplicate invitation with exist reservation */
  studentIdList = studentIdList.filter(
    (studentId) => roomReservationList.indexOf(studentId) == -1
  );

  studentIdList.forEach(async (studentId) => {
    await createReservation({
      roomId: reservation.roomId,
      studentId: studentId,
      startTime: reservation.from,
      endTime: reservation.to,
      secret: reservation.secret,
      state: reservationState.waiting,
    });
  });

  const date = convertTimeStampToDate(reservation["from"]);
  const startTime = convertTimestampToHHMM(reservation["from"]);
  const endTime = convertTimestampToHHMM(reservation["to"]);
  const inviterName = user.firstName + " " + user.lastName;

  /* Select only new participants to send email invitation */
  var invitation = {
    participants: participants
      .filter((item) => studentIdList.indexOf(item.studentId) != -1)
      .map((item) => item.email),
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

    const studentReservation = reservationList.filter(
      (reservation) => reservation.studentId == student.studentId
    );

    if (studentReservation.length == 0) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    try {
      const newReservation = await updateReservationState({
        id: studentReservation[0].id,
        newState: reservationState.booked,
      });

      const reservationDetail = await findReservationDetailById(
        newReservation.id
      );

      return res.json({
        success: true,
        data: {
          date: convertTimeStampToDate(reservationDetail.from),
          startTime: convertTimestampToHHMM(reservationDetail.from),
          endTime: convertTimestampToHHMM(reservationDetail.to),
          roomName: reservationDetail.roomName,
          roomCapacity: reservationDetail.roomCapacity,
          roomType: reservationDetail.roomType,
          roomFloor: reservationDetail.roomFloor,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error. Accept invitation failed",
      });
    }
  });
};

const cancelReservation = async (req, res) => {
  const { reservationId } = req.body;

  var reservation = await findReservationDetailById(reservationId);

  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: "Reservation not found",
    });
  }

  var user = req.headers?.user;
  user = JSON.parse(user);
  const studentId = user.studentId;

  console.log(studentId);
  console.log(reservation);

  console.log(reservation.studentId.length);
  console.log(studentId.length);

  if (reservation.studentId.normalize("NFC") != studentId.normalize("NFC")) {
    return res.status(400).json({
      success: false,
      message: "Reservation not belong to you",
    });
  }

  try {
    reservation = await updateReservationState({
      id: reservation.id,
      newState: reservationState.cancel,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }

  res.json({
    success: true,
    data: reservation,
  });
};

module.exports = {
  getRoomReservedCount,
  getBookingHistory,
  getTimeSlot,
  bookTimeSlot,
  checkInTimeSlot,
  findParticipants,
  createInvitation,
  acceptInvitation,
  cancelReservation,
};

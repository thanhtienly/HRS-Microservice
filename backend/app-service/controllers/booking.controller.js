require("dotenv").config();
const {
  getBookingHistoryByStudentId,
  findBookedTimeSlot,
  findOverlapTimeSlot,
  createReservation,
  findReservationDetailById,
  findAllReservationBySecret,
} = require("../services/booking.service");
const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");
const client = require("../services/client.service");

const convertToUTC7Full = (timestamp) => {
  return moment.tz(timestamp, "Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss");
};

const convertTimeStampToDate = (timestamp) => {
  return moment.tz(timestamp, "Asia/Ho_Chi_Minh").format("DD-MM-YYYY");
};

const convertTimestampToHHMM = (timestamp) => {
  return moment.tz(timestamp, "Asia/Ho_Chi_Minh").format("HH:mm");
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

const getBookedTimeSlot = async (req, res) => {
  const { date, roomId } = req.query;

  /* Check if the search date is not before today  */
  var startOfToday = new Date(new Date().setHours(0, 0, 0));
  if (new Date(date).getTime() < startOfToday.getTime()) {
    return res.status(400).json({
      success: false,
      message: "Search date can't be yesterday",
    });
  }

  /* Find all timeSlot's booked by other student */
  var bookedTimeSlot = await findBookedTimeSlot({ roomId, date });

  /* Can't find any booked timeSlot */
  if (bookedTimeSlot.length == 0) {
    return res.json({
      data: [],
      success: true,
    });
  }

  var timeSlotMerged = [];
  var tempMerged = bookedTimeSlot[0];

  for (let i = 1; i < bookedTimeSlot.length; i++) {
    /* Check if 2 timeSlot partial overlap, if partial overlap then merge them */
    if (tempMerged["to"] == bookedTimeSlot[i]["from"]) {
      tempMerged["to"] = bookedTimeSlot[i]["to"];
    } else {
      timeSlotMerged.push({
        date: date,
        from: convertTimestampToHHMM(tempMerged["from"]),
        to: convertTimestampToHHMM(tempMerged["to"]),
      });
      tempMerged = bookedTimeSlot[i];
    }
  }

  timeSlotMerged.push({
    date: date,
    from: convertTimestampToHHMM(tempMerged["from"]),
    to: convertTimestampToHHMM(tempMerged["to"]),
  });

  res.json({
    data: timeSlotMerged,
    success: true,
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

  var { date, roomId, from, to } = req.body;
  var startTime = new Date(`${date} ${from}`).getTime();
  var endTime = new Date(`${date} ${to}`).getTime();

  /* Invalid startTime, endTime constraint */
  if (startTime > endTime) {
    return res.status(400).json({
      success: false,
      message: "End time can't before start time",
    });
  }

  /* Invalid startTime constraint */
  if (startTime < new Date().getTime()) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid booking dateTime, you can't book a room with the past time",
    });
  }

  var overLapBooked = await findOverlapTimeSlot({ roomId, startTime, endTime });

  /* This booking overlaps with exist booking */
  if (overLapBooked.length != 0) {
    return res.status(400).json({
      success: false,
      message: "This booking overlaps with exist booking",
    });
  }

  try {
    const studentId = user["studentId"];
    const reservation = await createReservation({
      roomId,
      studentId,
      startTime,
      endTime,
    });

    res.json({
      success: true,
      data: {
        id: reservation["id"],
        roomId: reservation["roomId"],
        studentId: reservation["studentId"],
        from: reservation["from"],
        to: reservation["to"],
        reservedAt: reservation["reservedAt"],
        state: reservation["state"],
      },
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
      message: "This reservation's not belong to you",
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
      message:
        "The number of invited participants is larger than the remaining capacity of the room.",
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
        message: "Invalid secret, can't find any room with secret",
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
        message: "You've accepted the invitation once",
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
        message:
          "Currently, the room's full. Please ask the inviter about this problem",
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
  getBookingHistory,
  getBookedTimeSlot,
  bookTimeSlot,
  createInvitation,
  acceptInvitation,
};

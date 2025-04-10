const { getBookingHistoryByStudentId } = require("../services/booking.service");
const moment = require("moment-timezone");

const convertToUTC7Full = (timestamp) => {
  return moment.tz(timestamp, "Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss");
};

const getBookingHistory = async (req, res) => {
  var user = req.headers?.user;

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

module.exports = { getBookingHistory };

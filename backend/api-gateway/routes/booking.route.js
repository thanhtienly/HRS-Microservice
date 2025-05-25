const { Router } = require("express");
const bookingController = require("../controllers/booking.controller");
const {
  authorizedTokenMiddleware,
  isStudentMiddleware,
} = require("../middlewares/auth.middleware");
const router = Router();

router.get("/total", bookingController.handleGetRoomReservedCount);

router.get(
  "/history",
  authorizedTokenMiddleware,
  isStudentMiddleware,
  bookingController.handleGetBookingHistory
);

router.get("/time-slot", bookingController.handleGetTimeSlot);

router.post(
  "/time-slot",
  authorizedTokenMiddleware,
  isStudentMiddleware,
  bookingController.handleBookTimeSlot
);

router.post(
  "/time-slot/check-in",
  authorizedTokenMiddleware,
  isStudentMiddleware,
  bookingController.handleCheckInTimeSlot
);

router.post(
  "/participants",
  authorizedTokenMiddleware,
  isStudentMiddleware,
  bookingController.handleFindParticipants
);

router.post(
  "/invite",
  authorizedTokenMiddleware,
  isStudentMiddleware,
  bookingController.handleCreateInvitation
);

router.get("/invite/verify", bookingController.handleAcceptInvitation);

router.post(
  "/cancel",
  authorizedTokenMiddleware,
  isStudentMiddleware,
  bookingController.handleCancelBooking
);

module.exports = router;

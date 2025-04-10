const { Router } = require("express");
const bookingController = require("../controllers/booking.controller");
const {
  authorizedTokenMiddleware,
  isStudentMiddleware,
} = require("../middlewares/auth.middleware");
const router = Router();

router.get(
  "/history",
  authorizedTokenMiddleware,
  isStudentMiddleware,
  bookingController.handleGetBookingHistory
);

router.get("/time-slot", bookingController.handleGetBookedTimeSlot);
router.post(
  "/time-slot",
  authorizedTokenMiddleware,
  isStudentMiddleware,
  bookingController.handleBookTimeSlot
);

router.post(
  "/invite",
  authorizedTokenMiddleware,
  isStudentMiddleware,
  bookingController.handleCreateInvitation
);

router.get("/invite/verify", bookingController.handleAcceptInvitation);

module.exports = router;

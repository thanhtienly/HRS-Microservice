const { Router } = require("express");
const bookingController = require("../controllers/booking.controller");
const {
  validateQueryGetBookedTimeSlotDTO,
  validateBodyBookTimeSlotDTO,
  validateBodyInvitationDTO,
} = require("../middlewares/validation");
const router = Router();

router.get("/history", bookingController.getBookingHistory);
router.get(
  "/time-slot",
  validateQueryGetBookedTimeSlotDTO,
  bookingController.getBookedTimeSlot
);
router.post(
  "/time-slot",
  validateBodyBookTimeSlotDTO,
  bookingController.bookTimeSlot
);

router.post(
  "/invite",
  validateBodyInvitationDTO,
  bookingController.createInvitation
);

router.get("/invite/verify", bookingController.acceptInvitation);

module.exports = router;

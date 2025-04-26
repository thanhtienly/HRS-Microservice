const { Router } = require("express");
const bookingController = require("../controllers/booking.controller");
const {
  validateQueryGetTimeSlotDTO,
  validateBodyBookTimeSlotDTO,
  validateBodyInvitationDTO,
} = require("../middlewares/validation");
const router = Router();

router.get("/total", bookingController.getRoomReservedCount);

router.get("/history", bookingController.getBookingHistory);

router.get(
  "/time-slot",
  validateQueryGetTimeSlotDTO,
  bookingController.getTimeSlot
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

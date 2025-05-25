const { Router } = require("express");
const bookingController = require("../controllers/booking.controller");
const {
  validateQueryGetTimeSlotDTO,
  validateBodyBookTimeSlotDTO,
  validateBodyInvitationDTO,
  validateBodyCheckInTimeSlotDTO,
  validateBodyFindParticipantDTO,
  validateBodyReservationIdDTO,
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
  "/time-slot/check-in",
  validateBodyCheckInTimeSlotDTO,
  bookingController.checkInTimeSlot
);

router.post(
  "/participants",
  validateBodyFindParticipantDTO,
  bookingController.findParticipants
);

router.post(
  "/invite",
  validateBodyInvitationDTO,
  bookingController.createInvitation
);

router.get("/invite/verify", bookingController.acceptInvitation);

router.post(
  "/cancel",
  validateBodyReservationIdDTO,
  bookingController.cancelReservation
);

module.exports = router;

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

module.exports = router;

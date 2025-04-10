const { Router } = require("express");
const bookingController = require("../controllers/booking.controller");
const router = Router();

router.get("/history", bookingController.getBookingHistory);
module.exports = router;

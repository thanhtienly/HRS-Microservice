require("dotenv").config();
const { validateQuery, validateBody } = require("../validation");
const {
  getBookedTimeSlotDTO,
  bookTimeSlotDTO,
  invitationDTO,
} = require("../dto/booking.dto");

const validateRequestSource = (req, res, next) => {
  const apiSecret = req.headers["x-api-key"];

  if (!apiSecret || apiSecret != process.env.API_GATEWAY_SECRET) {
    return res.status(401).json({
      success: false,
      message: "Invalid source of request",
    });
  }
  next();
};

const validateQueryGetBookedTimeSlotDTO = (req, res, next) => {
  return validateQuery(getBookedTimeSlotDTO, req, res, next);
};

const validateBodyBookTimeSlotDTO = (req, res, next) => {
  return validateBody(bookTimeSlotDTO, req, res, next);
};

const validateBodyInvitationDTO = (req, res, next) => {
  return validateBody(invitationDTO, req, res, next);
};

module.exports = {
  validateRequestSource,
  validateQueryGetBookedTimeSlotDTO,
  validateBodyBookTimeSlotDTO,
  validateBodyInvitationDTO,
};

require("dotenv").config();
const { validateQuery, validateBody } = require("../validation");
const {
  getTimeSlotDTO,
  bookTimeSlotDTO,
  checkInTimeSlotDTO,
  invitationDTO,
  findParticipantDTO,
  reservationIdDTO,
} = require("../dto/booking.dto");
const {
  getRoomListWithQueryDTO,
  createRoomFeedbackDTO,
} = require("../dto/room.dto");

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

const validateQueryGetRoomListDTO = (req, res, next) => {
  return validateQuery(getRoomListWithQueryDTO, req, res, next);
};

const validateQueryGetTimeSlotDTO = (req, res, next) => {
  return validateQuery(getTimeSlotDTO, req, res, next);
};

const validateBodyCreateRoomFeedbackDTO = (req, res, next) => {
  return validateBody(createRoomFeedbackDTO, req, res, next);
};

const validateBodyBookTimeSlotDTO = (req, res, next) => {
  return validateBody(bookTimeSlotDTO, req, res, next);
};

const validateBodyCheckInTimeSlotDTO = (req, res, next) => {
  return validateBody(checkInTimeSlotDTO, req, res, next);
};

const validateBodyInvitationDTO = (req, res, next) => {
  return validateBody(invitationDTO, req, res, next);
};

const validateBodyFindParticipantDTO = (req, res, next) => {
  return validateBody(findParticipantDTO, req, res, next);
};

const validateBodyReservationIdDTO = (req, res, next) => {
  return validateBody(reservationIdDTO, req, res, next);
};

module.exports = {
  validateRequestSource,
  validateQueryGetRoomListDTO,
  validateQueryGetTimeSlotDTO,
  validateBodyCreateRoomFeedbackDTO,
  validateBodyBookTimeSlotDTO,
  validateBodyCheckInTimeSlotDTO,
  validateBodyInvitationDTO,
  validateBodyFindParticipantDTO,
  validateBodyReservationIdDTO,
};

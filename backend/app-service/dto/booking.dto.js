const Joi = require("joi");

const getTimeSlotDTO = Joi.object({
  date: Joi.string().isoDate().required(),
  roomId: Joi.string().uuid().required(),
}).required();

const bookTimeSlotDTO = Joi.object({
  date: Joi.string().isoDate().required(),
  roomId: Joi.string().uuid().required(),
  timeSlot: Joi.array()
    .min(1)
    .items(
      Joi.string()
        .pattern(/^[0-9]{2}:[0-9]{2} - [0-9]{2}:[0-9]{2}$/)
        .required()
    )
    .required(),
}).required();

const checkInTimeSlotDTO = Joi.object({
  date: Joi.string().isoDate().required(),
  roomId: Joi.string().uuid().required(),
  timeSlot: Joi.string()
    .pattern(/^[0-9]{2}:[0-9]{2} - [0-9]{2}:[0-9]{2}$/)
    .required(),
}).required();

const invitationDTO = Joi.object({
  reservationId: Joi.string().uuid().required(),
  participants: Joi.array()
    .min(1)
    .items(
      Joi.object({
        email: Joi.string().email().required(),
        studentId: Joi.string().max(10).required(),
      }).required()
    )
    .required(),
}).required();

const findParticipantDTO = Joi.object({
  secret: Joi.string().required(),
}).required();

const reservationIdDTO = Joi.object({
  reservationId: Joi.string().uuid().required(),
}).required();

module.exports = {
  getTimeSlotDTO,
  bookTimeSlotDTO,
  checkInTimeSlotDTO,
  invitationDTO,
  findParticipantDTO,
  reservationIdDTO,
};

const Joi = require("joi");

const getBookedTimeSlotDTO = Joi.object({
  date: Joi.string().isoDate().required(),
  roomId: Joi.string().required(),
}).required();

const bookTimeSlotDTO = Joi.object({
  date: Joi.string().isoDate().required(),
  roomId: Joi.string().required(),
  from: Joi.string()
    .pattern(/^[0-9]{2}:[0-9]{2}$/)
    .required(),
  to: Joi.string()
    .pattern(/^[0-9]{2}:[0-9]{2}$/)
    .required(),
}).required();

const invitationDTO = Joi.object({
  reservationId: Joi.string().required(),
  participants: Joi.array()
    .min(1)
    .items(Joi.string().email().required())
    .required(),
}).required();

module.exports = { getBookedTimeSlotDTO, bookTimeSlotDTO, invitationDTO };

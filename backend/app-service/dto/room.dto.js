const Joi = require("joi");
const validRoomType = ["Individual", "Group", "Mentoring"];

const getRoomListWithQueryDTO = Joi.object({
  roomType: Joi.string()
    .valid(...validRoomType)
    .required(),
  ssaId: Joi.string().uuid().required(),
}).required();

const createRoomFeedbackDTO = Joi.object({
  content: Joi.string().required(),
}).required();

module.exports = { getRoomListWithQueryDTO, createRoomFeedbackDTO };

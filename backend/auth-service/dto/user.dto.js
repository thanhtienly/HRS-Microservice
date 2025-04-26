const Joi = require("joi");

const validGender = {
  Nam: "Male",
  Nữ: "Female",
  Khác: "Other",
};

const createStudentDTO = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  studentId: Joi.string()
    .length(7)
    .pattern(/^[0-9]{7}$/)
    .required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  gender: Joi.string().valid(...Object.values(validGender)),
}).required();

const loginDTO = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).required();

const searchStudentDTO = Joi.object({
  email: Joi.string().email().required(),
}).required();

const studentIdDTO = Joi.object({
  studentId: Joi.string().max(10).required(),
}).required();

module.exports = { createStudentDTO, loginDTO, searchStudentDTO, studentIdDTO };

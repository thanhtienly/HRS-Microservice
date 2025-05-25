const Joi = require("joi");

const validGender = {
  Nam: "Male",
  Nữ: "Female",
  Khác: "Other",
};

const createStudentDTO = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "'Email' must be in format abc@def.*",
    "string.empty": "'Email' is not allowed to be empty",
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/)
    .required()
    .messages({
      "string.empty": "'Password' is not allowed to be empty",
      "string.min": "'Password' must has min length of 8",
      "string.pattern.base": `'Password' must has: 
          - At least 1 uppercase character. Ex: A-Z
          - At least 1 lowercase character A-Z. Ex: a-z
          - At least 1 numeric character A-Z. Ex: 0-9
          - At least 1 special character A-Z. Ex: #?!@$%^&*-
        `,
    }),
  studentId: Joi.string()
    .length(7)
    .pattern(/^[0-9]{7}$/)
    .required()
    .messages({
      "string.empty": "'Student Id' is not allowed to be empty",
      "string.pattern.base":
        "'Student Id' must be a string of only numeric (0-9) with length of 7",
    }),
  firstName: Joi.string().required().messages({
    "string.empty": "'First name' is not allowed to be empty",
  }),
  lastName: Joi.string().required().messages({
    "string.empty": "'Last name' is not allowed to be empty",
  }),
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

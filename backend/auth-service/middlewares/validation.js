require("dotenv").config();
const { validateBody, validateQuery } = require("../validation");
const {
  createStudentDTO,
  loginDTO,
  searchStudentDTO,
  studentIdDTO,
} = require("../dto/user.dto");

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

const validateCreateStudentDTO = (req, res, next) => {
  return validateBody(createStudentDTO, req, res, next);
};

const validateLoginDTO = (req, res, next) => {
  return validateBody(loginDTO, req, res, next);
};

const validateBodySearchStudentDTO = (req, res, next) => {
  return validateBody(searchStudentDTO, req, res, next);
};

const validateBodyStudentIdDTO = (req, res, next) => {
  return validateBody(studentIdDTO, req, res, next);
};

module.exports = {
  validateRequestSource,
  validateCreateStudentDTO,
  validateLoginDTO,
  validateBodySearchStudentDTO,
  validateBodyStudentIdDTO,
};

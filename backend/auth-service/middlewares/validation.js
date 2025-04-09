require("dotenv").config();
const { validateBody, validateQuery } = require("../validation");
const { createStudentDTO } = require("../dto/user.dto");

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

module.exports = { validateCreateStudentDTO, validateRequestSource };

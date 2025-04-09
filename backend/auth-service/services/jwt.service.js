require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateToken = (
  payload = {
    studentId: "",
    firstName: "",
    lastName: "",
    email: "",
  }
) => {
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_LIFETIME,
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.JWT_REFRESH_TOKEN_LIFETIME,
  });

  return {
    accessToken,
    refreshToken,
  };
};

module.exports = {
  generateToken,
};

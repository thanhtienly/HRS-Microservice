require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateVerifyToken = async ({ email }) => {
  const token = jwt.sign({ email }, process.env.JWT_TOKEN_SECRET);
  return token;
};

module.exports = { generateVerifyToken };

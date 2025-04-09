require("dotenv").config();

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

module.exports = {
  validateRequestSource,
};

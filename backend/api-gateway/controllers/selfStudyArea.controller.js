require("dotenv").config();
const client = require("../services/client.service");

const handleGetAllSelfStudyArea = async (req, res) => {
  var urlPath = req.originalUrl;

  const APP_SERVICE_HOST = process.env.APP_SERVICE_HOST;
  const response = await client.get(`${APP_SERVICE_HOST}${urlPath}`, {
    headers: {
      "Content-Type": "application/json",
      "correlation-id": req.headers["correlation-id"],
    },
  });

  res.status(response.status).json({
    success: response.success,
    data: response?.data,
    message: response?.message,
  });
};

module.exports = { handleGetAllSelfStudyArea };

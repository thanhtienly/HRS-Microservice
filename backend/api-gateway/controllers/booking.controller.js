const client = require("../services/client.service");

const handleGetBookingHistory = async (req, res) => {
  const user = req["user"];
  var urlPath = req.originalUrl;
  console.log(user);

  const APP_SERVICE_HOST = process.env.APP_SERVICE_HOST;
  const response = await client.get(`${APP_SERVICE_HOST}${urlPath}`, {
    headers: {
      "Content-Type": "application/json",
      user: JSON.stringify(user),
    },
  });

  res.status(response.status).json({
    success: response.success,
    data: response?.data,
    message: response?.message,
  });
};

module.exports = { handleGetBookingHistory };

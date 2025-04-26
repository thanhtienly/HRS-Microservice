require("dotenv").config();
const client = require("../services/client.service");

const handleGetRoomType = async (req, res) => {
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

const handleGetRoomListWithQuery = async (req, res) => {
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

const handleGetRoomDetail = async (req, res) => {
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

const handleCreateFeedback = async (req, res) => {
  const user = req["user"];
  var urlPath = req.originalUrl;

  const APP_SERVICE_HOST = process.env.APP_SERVICE_HOST;
  const response = await client.post(
    `${APP_SERVICE_HOST}${urlPath}`,
    { ...req.body },
    {
      headers: {
        "Content-Type": "application/json",
        user: JSON.stringify(user),
        "correlation-id": req.headers["correlation-id"],
      },
    }
  );

  res.status(response.status).json({
    success: response.success,
    data: response?.data,
    message: response?.message,
  });
};

const handleGetRoomFeedback = async (req, res) => {
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

module.exports = {
  handleGetRoomType,
  handleGetRoomListWithQuery,
  handleGetRoomDetail,
  handleCreateFeedback,
  handleGetRoomFeedback,
};

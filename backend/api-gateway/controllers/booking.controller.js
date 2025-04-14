require("dotenv").config();
const client = require("../services/client.service");
const jwt = require("jsonwebtoken");
const { publishToQueue } = require("../services/rabbitmq.service");

const RABBITMQ_EXCHANGE = process.env.RABBITMQ_EXCHANGE;
const RABBITMQ_INVITATION_QUEUE = process.env.RABBITMQ_INVITATION_QUEUE;
const RABBITMQ_INVITATION_ROUTE_KEY = process.env.RABBITMQ_INVITATION_ROUTE_KEY;

const handleGetBookingHistory = async (req, res) => {
  const user = req["user"];
  var urlPath = req.originalUrl;

  const APP_SERVICE_HOST = process.env.APP_SERVICE_HOST;
  const response = await client.get(`${APP_SERVICE_HOST}${urlPath}`, {
    headers: {
      "Content-Type": "application/json",
      user: JSON.stringify(user),
      "correlation-id": req.headers["correlation-id"],
    },
  });

  res.status(response.status).json({
    success: response.success,
    data: response?.data,
    message: response?.message,
  });
};

const handleGetBookedTimeSlot = async (req, res) => {
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

const handleBookTimeSlot = async (req, res) => {
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

const handleCreateInvitation = async (req, res) => {
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

  if (!response.success) {
    return res.status(response.status).json({
      success: response.success,
      data: response?.data,
      message: response?.message,
    });
  }

  const invitation = response.data;
  const participants = invitation.participants;

  participants.forEach(async (email) => {
    var token = jwt.sign(
      {
        secret: invitation.secret,
        email: email,
      },
      process.env.JWT_TOKEN_SECRET
    );

    await publishToQueue(
      RABBITMQ_EXCHANGE,
      RABBITMQ_INVITATION_QUEUE,
      RABBITMQ_INVITATION_ROUTE_KEY,
      JSON.stringify({
        email: email,
        inviterName: invitation.inviterName,
        roomName: invitation.roomName,
        roomType: invitation.roomType,
        date: invitation.date,
        startTime: invitation.startTime,
        endTime: invitation.endTime,
        invitationURL: `${process.env.API_GATEWAY_HOST}/booking/invite/verify?token=${token}`,
      })
    );
  });

  res.status(response.status).json({
    success: response.success,
    data: response?.data,
    message: response?.message,
  });
};

const handleAcceptInvitation = async (req, res) => {
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
  handleGetBookingHistory,
  handleGetBookedTimeSlot,
  handleBookTimeSlot,
  handleCreateInvitation,
  handleAcceptInvitation,
};

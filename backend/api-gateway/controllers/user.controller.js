const client = require("../services/client.service");
const { generateVerifyToken } = require("../services/jwt.service");
const { publishToQueue } = require("../services/rabbitmq.service");

const RABBITMQ_EXCHANGE = process.env.RABBITMQ_EXCHANGE;
const RABBITMQ_VERIFY_QUEUE = process.env.RABBITMQ_VERIFY_QUEUE;
const RABBITMQ_VERIFY_ROUTE_KEY = process.env.RABBITMQ_VERIFY_ROUTE_KEY;

const AUTH_SERVICE_HOST = process.env.AUTH_SERVICE_HOST;
const API_GATEWAY_HOST = process.env.API_GATEWAY_HOST;

const handleSignUpStudent = async (req, res) => {
  var response = await client.post(
    `${AUTH_SERVICE_HOST}/auth/student/sign-up`,
    {
      ...req.body,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (response.success) {
    const verifyToken = await generateVerifyToken({
      email: response.data.email,
    });
    await publishToQueue(
      RABBITMQ_EXCHANGE,
      RABBITMQ_VERIFY_QUEUE,
      RABBITMQ_VERIFY_ROUTE_KEY,
      JSON.stringify({
        email: response.data.email,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        verifyURL: `${API_GATEWAY_HOST}/auth/student/verify?token=${verifyToken}`,
      })
    );
  }

  res.status(response.status).json({
    success: response.success,
    data: response?.data,
    message: response?.message,
  });
};

module.exports = { handleSignUpStudent };

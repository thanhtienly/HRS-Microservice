require("dotenv").config();
const { publishToQueue } = require("../services/rabbitmq.service");
const { hiddenValue } = require("../utils/logging");

const initCorrelationId = (req, res, next) => {
  const requestStartTime = new Date().toISOString();

  req.headers["x-request-received-at"] = requestStartTime;
  next();
};

const publishLog = (req, res, next) => {
  const oldSend = res.send;
  res.send = (data) => {
    var requestBody =
      req?.body == undefined ? {} : JSON.parse(JSON.stringify(req?.body));
    var requestQuery =
      req?.query == undefined ? {} : JSON.parse(JSON.stringify(req?.query));
    var requestParams =
      req?.params == undefined ? {} : JSON.parse(JSON.stringify(req?.params));
    var responseBody = data == undefined ? data : JSON.parse(data);

    var log = {
      service: process.env.SERVICE_NAME,
      host: req.host,
      path: req.originalUrl,
      correlationId: req.headers["correlation-id"],
      user: hiddenValue(req?.user),
      request: {
        method: req.method.toUpperCase(),
        startedAt: req.headers["x-request-received-at"],
        endedAt: new Date().toISOString(),
        body: hiddenValue(requestBody),
        query: hiddenValue(requestQuery),
        params: hiddenValue(requestParams),
      },
      response: {
        data: hiddenValue(responseBody?.data),
        success: responseBody.success,
        message: responseBody?.message,
        status: res.statusCode,
      },
    };

    try {
      publishToQueue(
        process.env.RABBITMQ_EXCHANGE,
        process.env.RABBITMQ_LOG_QUEUE,
        process.env.RABBITMQ_LOG_ROUTE_KEY,
        JSON.stringify(log)
      );
    } catch (error) {
      console.log(error);
    }

    res.send = oldSend; // set function back to avoid the 'double-send'
    return res.send(data); // just call as normal with data
  };
  next();
};

module.exports = { initCorrelationId, publishLog };

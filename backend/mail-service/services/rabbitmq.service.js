require("dotenv").config();
var amqplib = require("amqplib");
const {
  sendVerifyAccountEmail,
  sendJoinRoomInvitationEmail,
} = require("./mail.service");

const consumeVerifyAccountQueue = async () => {
  var connection = await amqplib.connect(
    `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@localhost:${process.env.RABBITMQ_PORT}`
  );
  var channel = await connection.createChannel();
  var exchange = process.env.RABBITMQ_EXCHANGE;
  var queue = process.env.RABBITMQ_VERIFY_QUEUE;
  var routeKey = process.env.RABBITMQ_VERIFY_ROUTE_KEY;

  await channel
    .assertExchange(exchange, "direct", { durable: true })
    .catch((err) => console.log(err));
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, routeKey);

  console.log("Verify account consumer is running");
  await channel.consume(queue, async function (msg) {
    const data = JSON.parse(msg.content.toString());
    try {
      await sendVerifyAccountEmail(data);
      channel.ack(msg);
      console.log("Ack verify account message successfully with data: ");
      console.log(data);
    } catch (error) {
      console.log("Error when sending verify account email");
    }
  });
};

const consumeInvitationQueue = async () => {
  var connection = await amqplib.connect(
    `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@localhost:${process.env.RABBITMQ_PORT}`
  );
  var channel = await connection.createChannel();
  var exchange = process.env.RABBITMQ_EXCHANGE;
  var queue = process.env.RABBITMQ_INVITATION_QUEUE;
  var routeKey = process.env.RABBITMQ_INVITATION_ROUTE_KEY;

  await channel
    .assertExchange(exchange, "direct", { durable: true })
    .catch((err) => console.log(err));
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, routeKey);

  console.log("Invitation consumer is running");
  await channel.consume(queue, async function (msg) {
    const data = JSON.parse(msg.content.toString());
    try {
      await sendJoinRoomInvitationEmail(data);
      channel.ack(msg);
      console.log("Ack invitation message successfully with data: ");
      console.log(data);
    } catch (error) {
      console.log("Error when sending invitation email");
    }
  });
};

const rabbitMQConsumer = async () => {
  await consumeVerifyAccountQueue();
  await consumeInvitationQueue();
};

module.exports = {
  rabbitMQConsumer,
};

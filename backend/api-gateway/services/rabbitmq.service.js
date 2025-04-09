require("dotenv").config();
var amqplib = require("amqplib");

const publishToQueue = async (
  exchange,
  queue,
  routeKey,
  data = JSON.stringify({})
) => {
  var connection = await amqplib.connect(
    `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@localhost:${process.env.RABBITMQ_PORT}`
  );

  var channel = await connection.createChannel();

  await channel
    .assertExchange(exchange, "direct", { durable: true })
    .catch((err) => console.log(err));
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, routeKey);

  channel.publish(exchange, routeKey, Buffer.from(data));
  console.log("Publish message to rabbitMQ queue successfully");

  setTimeout(() => {
    connection.close();
  }, 500);
};

module.exports = {
  publishToQueue,
};

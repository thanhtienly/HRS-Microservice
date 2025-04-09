require("dotenv").config();
const express = require("express");
const PORT = process.env.PORT;

const app = express();
app.use(express.json());

const { rabbitMQConsumer } = require("./services/rabbitmq.service");

app.listen(PORT, async () => {
  await rabbitMQConsumer();
  console.log(`Mail service's listening on port ${PORT}`);
});

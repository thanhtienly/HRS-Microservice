require("dotenv").config();
const express = require("express");
const { sequelize, initDB } = require("./database/config");
const { seed } = require("./database/seed");
const cors = require("cors");

const PORT = process.env.PORT;

const { CheckIn } = require("./models/CheckIn");
const { Feedback } = require("./models/Feedback");
const { RepairSchedule } = require("./models/RepairSchedule");
const { Reservation } = require("./models/Reservation");
const { Room } = require("./models/Room");
const { SelfStudyArea } = require("./models/SelfStudyArea");
const associations = require("./models/associations");

const { validateRequestSource } = require("./middlewares/validation");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.API_GATEWAY_HOST,
  })
);

const bookingRoute = require("./routes/booking.route");
const ssaRoute = require("./routes/selfStudyArea.route");
const roomRoute = require("./routes/room.route");
const logger = require("./middlewares/logging.middleware");

app.use(logger.initCorrelationId);
app.use(logger.publishLog);

app.use("/booking", validateRequestSource, bookingRoute);
app.use("/self-study-area", validateRequestSource, ssaRoute);
app.use("/room", validateRequestSource, roomRoute);

initDB()
  .then(() => {
    sequelize.sync({ alter: true }).then(async () => {
      console.log("Connected to MySQL");
      try {
        await seed();
      } catch (error) {}

      app.listen(PORT, () => {
        console.log(`App service's listening on port ${PORT}`);
      });
    });
  })
  .catch((error) => {
    console.log(error);
  });

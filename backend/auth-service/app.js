require("dotenv").config();
const express = require("express");
const { sequelize, initDB } = require("./database/config");
const cors = require("cors");

const PORT = process.env.PORT || 8000;

const { Student } = require("./models/Student");
const { Staff } = require("./models/Staff");
const { Manager } = require("./models/Manager");

const { validateRequestSource } = require("./middlewares/validation");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.API_GATEWAY_HOST,
  })
);

const userRoute = require("./routes/user.route");

const logger = require("./middlewares/logging.middleware");

app.use(logger.initCorrelationId);
app.use(logger.publishLog);

app.use("/auth", validateRequestSource, userRoute);

initDB()
  .then(() => {
    sequelize.sync().then(async () => {
      console.log("Connected to MySQL");

      app.listen(PORT, () => {
        console.log(`Auth service's listening on port ${PORT}`);
      });
    });
  })
  .catch((error) => {
    console.log(error);
  });

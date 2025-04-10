require("dotenv").config();
const express = require("express");
const PORT = process.env.PORT;

const app = express();
app.use(express.json());

const userRoute = require("./routes/user.route");
const bookingRoute = require("./routes/booking.route");

app.use("/auth", userRoute);
app.use("/booking", bookingRoute);

app.listen(PORT, () => {
  console.log(`Api gateway's listening on port ${PORT}`);
});

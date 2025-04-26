const moment = require("moment");

const convertToUTC7Full = (timestamp) => {
  return moment.tz(timestamp, "Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss");
};

const convertTimeStampToDate = (timestamp) => {
  return moment.tz(timestamp, "Asia/Ho_Chi_Minh").format("DD-MM-YYYY");
};

const convertTimestampToHHMM = (timestamp) => {
  return moment.tz(timestamp, "Asia/Ho_Chi_Minh").format("HH:mm");
};

module.exports = {
  convertToUTC7Full,
  convertTimeStampToDate,
  convertTimestampToHHMM,
};

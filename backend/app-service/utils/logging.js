const keyToHidden = [
  "password",
  "email",
  "studentId",
  "staffId",
  "managerId",
  "accessToken",
  "refreshToken",
];
const { generateKeySync } = require("crypto");

const hiddenValue = (input = {}) => {
  if (!input) {
    return {};
  }

  var keys = Object.keys(input);

  keys.forEach((key) => {
    if (keyToHidden.indexOf(key) != -1) {
      input[key] = generateKeySync("hmac", {
        length: 128,
      })
        .export()
        .toString("hex");
    }
  });

  return input;
};

module.exports = { hiddenValue };

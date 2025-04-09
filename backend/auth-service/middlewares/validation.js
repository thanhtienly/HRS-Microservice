const { validateBody, validateQuery } = require("../validation");
const { createStudentDTO } = require("../dto/user.dto");

const validateCreateStudentDTO = (req, res, next) => {
  return validateBody(createStudentDTO, req, res, next);
};

module.exports = { validateCreateStudentDTO };

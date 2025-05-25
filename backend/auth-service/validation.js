/*
 * dto: Schema create from Joi
 * data: req.body ? req.param ? req.query
 */

const validate = (schema, data) => {
  return schema.validate(data);
};

const getErrorMessage = (details) => {
  console.log(details);
  var messages = details.map((item) => item.message);

  /* Show first error message */
  return messages[0];
};

const validateBody = (schema, req, res, next) => {
  var data = req.body;

  if (!data) {
    return res.status(400).json({
      success: false,
      message: "Request body required",
    });
  }

  const { error } = validate(schema, data);

  if (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error.details),
    });
  }

  next();
};

const validateQuery = (schema, req, res, next) => {
  var data = req.query;

  const { error } = validate(schema, data);

  if (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error.details),
    });
  }

  next();
};

module.exports = {
  validateBody,
  validateQuery,
};

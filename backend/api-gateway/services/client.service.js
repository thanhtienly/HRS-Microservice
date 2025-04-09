const axios = require("axios");

const post = async (
  url = "",
  body = {},
  headers = {
    headers: {},
  }
) => {
  const response = await axios
    .post(
      url,
      {
        ...body,
      },
      {
        headers: { ...headers },
      }
    )
    .then((res) => {
      return {
        status: res.status,
        success: res.data.success,
        data: res.data.data,
      };
    })
    .catch((err) => {
      return {
        status: err.status,
        success: false,
        message: err.response.data.message,
      };
    });

  return response;
};

module.exports = { post };

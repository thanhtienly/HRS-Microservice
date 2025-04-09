const axios = require("axios");
require("dotenv").config();

const post = async (url = "", body = {}, headers = {}) => {
  axios.defaults.headers["x-api-key"] = process.env.API_GATEWAY_SECRET;
  const response = await axios
    .post(
      url,
      {
        ...body,
      },
      { headers: { ...headers } }
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

const get = async (url = "", body = {}, headers = {}) => {
  axios.defaults.headers["x-api-key"] = process.env.API_GATEWAY_SECRET;
  const response = await axios
    .get(
      url,
      {
        ...body,
      },
      { headers: { ...headers } }
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

module.exports = { post, get };

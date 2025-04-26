const { Sequelize } = require("sequelize");
require("dotenv").config();

// Load environment variables
const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_PORT = process.env.MYSQL_PORT;
const MYSQL_USERNAME = process.env.MYSQL_USERNAME;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE;

const sequelizeOption = {
  username: MYSQL_USERNAME,
  password: MYSQL_PASSWORD,
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  dialect: "mysql",
  logging: false,
  define: {
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
  }
};

async function initDB() {
  const sequelize = new Sequelize(sequelizeOption);
  try {
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE}`);
  } catch (error) {
    console.log("Error with creating database");
  }
}

initDB();

const sequelize = new Sequelize({
  ...sequelizeOption,
  database: MYSQL_DATABASE,
});

module.exports = { initDB, sequelize };

require("dotenv").config();
const {
  findStudentByEmail,
  createStudent,
} = require("../services/user.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signUpStudent = async (req, res) => {
  var { email, password, studentId, firstName, lastName, gender } = req.body;

  var student = await findStudentByEmail({ email });

  if (student) {
    return res.status(403).json({
      success: false,
      message: "Email used by other student",
    });
  }

  password = bcrypt.hashSync(password, 10);

  try {
    student = await createStudent({
      email,
      password,
      studentId,
      firstName,
      lastName,
      gender,
    });
  } catch (error) {
    if (error["name"] == "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ message: "studentId use by other student", success: false });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error when creating student",
    });
  }

  res.json({
    success: true,
    data: student,
  });
};

const verifyStudent = async (req, res) => {};

const logInStudent = async (req, res) => {};

module.exports = { signUpStudent, logInStudent, verifyStudent };

require("dotenv").config();
const {
  findStudentByEmail,
  createStudent,
  updateStudentVerifyStatus,
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

const verifyStudent = async (req, res) => {
  const token = req.query?.token;

  if (!token) {
    return res.status(404).json({
      success: false,
      message: "Token query param is required",
    });
  }

  try {
    var payload = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid token",
    });
  }

  const email = payload.email;

  try {
    var student = await updateStudentVerifyStatus({ email });
    console.log(student);
    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error when updating student verify status",
    });
  }
};

const logInStudent = async (req, res) => {};

module.exports = { signUpStudent, logInStudent, verifyStudent };

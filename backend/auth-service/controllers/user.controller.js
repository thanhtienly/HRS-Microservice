require("dotenv").config();
const {
  findStudentByEmail,
  createStudent,
  updateStudentVerifyStatus,
} = require("../services/user.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../services/jwt.service");

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
    await updateStudentVerifyStatus({ email });

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

const logInStudent = async (req, res) => {
  const { email, password } = req.body;

  const student = await findStudentByEmail({ email });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Can't find any account with this email",
    });
  }

  if (!student.isVerify) {
    return res.status(401).json({
      success: false,
      message: "Account's not verify",
    });
  }

  const isPasswordMatch = bcrypt.compareSync(password, student.password);

  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: "Password's not match",
    });
  }

  const payload = {
    studentId: student.studentId,
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
  };

  const { accessToken, refreshToken } = generateToken(payload);

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
    },
  });
};

module.exports = { signUpStudent, logInStudent, verifyStudent };

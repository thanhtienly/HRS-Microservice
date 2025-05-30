const { Staff } = require("../models/Staff");
const { Student } = require("../models/Student");
const { Manager } = require("../models/Manager");

const createStudent = async ({
  email,
  password,
  studentId,
  firstName,
  lastName,
  gender,
}) => {
  return await Student.create({
    email,
    password,
    studentId,
    firstName,
    lastName,
    gender,
  });
};

const findStudentByEmail = async ({ email }) => {
  return await Student.findOne({
    where: { email },
  });
};

const updateStudentVerifyStatus = async ({ email }) => {
  return await Student.update(
    {
      isVerify: true,
      verifiedAt: new Date().getTime(),
    },
    {
      where: {
        email,
      },
    }
  );
};

const findStudentByStudentId = async ({ studentId }) => {
  return await Student.findOne({
    where: {
      studentId: studentId,
    },
  });
};

module.exports = {
  createStudent,
  findStudentByEmail,
  updateStudentVerifyStatus,
  findStudentByStudentId,
};

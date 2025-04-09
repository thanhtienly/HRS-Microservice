const { Router } = require("express");
const userController = require("../controllers/user.controller");
const validation = require("../middlewares/validation");
const router = Router();

router.post(
  "/student/sign-up",
  validation.validateCreateStudentDTO,
  userController.signUpStudent
);

router.get("/student/verify", userController.verifyStudent);

router.post(
  "/student/log-in",
  validation.validateLoginDTO,
  userController.logInStudent
);

module.exports = router;

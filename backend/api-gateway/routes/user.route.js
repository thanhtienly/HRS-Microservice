const { Router } = require("express");
const userController = require("../controllers/user.controller");
const validation = require("../middlewares/validation");
const router = Router();

router.post(
  "/student/sign-up",
  validation.validateCreateStudentDTO,
  userController.handleSignUpStudent
);
router.get("/student/verify", userController.handleVerifyStudent);
module.exports = router;

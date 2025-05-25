const { Router } = require("express");
const userController = require("../controllers/user.controller");
const { authorizedTokenMiddleware } = require("../middlewares/auth.middleware");
const router = Router();

router.post("/student/sign-up", userController.handleSignUpStudent);
router.get("/student/verify", userController.handleVerifyStudent);
router.post("/student/log-in", userController.handleLoginStudent);
router.post(
  "/student/find-by-student-id",
  authorizedTokenMiddleware,
  userController.handleSearchStudentByStudentId
);

module.exports = router;

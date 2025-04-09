const { Router } = require("express");
const userController = require("../controllers/user.controller");
const router = Router();

router.post("/student/sign-up", userController.handleSignUpStudent);
router.get("/student/verify", userController.handleVerifyStudent);
router.post("/student/log-in", userController.handleLoginStudent);

module.exports = router;

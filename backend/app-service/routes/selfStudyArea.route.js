const { Router } = require("express");
const ssaController = require("../controllers/selfStudyArea.controller");
const router = Router();

router.get("/", ssaController.getAllSelfStudyArea);

module.exports = router;

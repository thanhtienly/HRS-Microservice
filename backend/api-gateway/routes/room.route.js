const { Router } = require("express");
const roomController = require("../controllers/room.controller");
const {
  authorizedTokenMiddleware,
  isStudentMiddleware,
} = require("../middlewares/auth.middleware");
const router = Router();

router.get("/type", roomController.handleGetRoomType);
router.get("/", roomController.handleGetRoomListWithQuery);
router.get("/:id", roomController.handleGetRoomDetail);

router.post(
  "/:id/feedback",
  authorizedTokenMiddleware,
  isStudentMiddleware,
  roomController.handleCreateFeedback
);

router.get("/:id/feedback", roomController.handleGetRoomFeedback);

module.exports = router;

const { Router } = require("express");
const roomController = require("../controllers/room.controller");
const {
  validateQueryGetRoomListDTO,
  validateBodyCreateRoomFeedbackDTO,
} = require("../middlewares/validation");
const router = Router();

router.get("/type", roomController.getRoomType);
router.get("/", validateQueryGetRoomListDTO, roomController.getRoomWithQuery);
router.get("/:id", roomController.getRoomDetail);

router.post(
  "/:id/feedback",
  validateBodyCreateRoomFeedbackDTO,
  roomController.createFeedback
);

router.get("/:id/feedback", roomController.getRoomFeedback);

module.exports = router;

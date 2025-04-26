require("dotenv").config();
const {
  getAllRoomType,
  getRoomListBySsaIdAndRoomType,
  getRoomDetailById,
  createRoomFeedback,
  getRoomFeedbackByRoomId,
} = require("../services/room.service");
const { convertToUTC7Full } = require("../utils/date");
const client = require("../services/client.service");

const getRoomType = async (req, res) => {
  try {
    var roomTypeList = await getAllRoomType();
    res.json({
      success: true,
      data: roomTypeList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getRoomWithQuery = async (req, res) => {
  const { roomType, ssaId } = req.query;

  try {
    const roomList = await getRoomListBySsaIdAndRoomType({ roomType, ssaId });

    res.json({ success: true, data: roomList });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getRoomDetail = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(404).json({
      success: false,
      message: "RoomId is missing",
    });
  }

  try {
    const roomDetail = await getRoomDetailById({ id });

    res.json({
      success: true,
      data: roomDetail,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const createFeedback = async (req, res) => {
  const roomId = req.params?.id;

  if (!roomId) {
    return res.status(404).json({
      success: false,
      message: "RoomId is missing",
    });
  }
  const { content } = req.body;
  var user = req.headers?.user;

  /* This request don't have auth info */
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorization the request",
    });
  }

  user = JSON.parse(user);

  try {
    const feedback = await createRoomFeedback({
      roomId: roomId,
      content: content,
      studentId: user?.studentId,
    });
    res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getRoomFeedback = async (req, res) => {
  const roomId = req.params?.id;

  if (!roomId) {
    return res.status(404).json({
      success: false,
      message: "RoomId is missing",
    });
  }

  var feedbackList = await getRoomFeedbackByRoomId({
    roomId: roomId,
  });

  feedbackList = await Promise.all(
    feedbackList.map(async (feedback) => {
      /* Call Auth Service to get student name from studentId */
      var studentName = "Anonymous";
      const response = await client.post(
        `${process.env.AUTH_SERVICE_HOST}/auth/student/find-by-student-id`,
        {
          studentId: feedback.studentId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "correlation-id": req.headers["correlation-id"],
          },
        }
      );

      if (response.success) {
        studentName = response.data.lastName + " " + response.data.firstName;
      }

      return {
        id: feedback.id,
        studentName: studentName,
        date: convertToUTC7Full(feedback.createdAt),
        content: feedback.content,
      };
    })
  );

  res.json({
    success: true,
    data: feedbackList,
  });
};

module.exports = {
  getRoomType,
  getRoomWithQuery,
  getRoomDetail,
  createFeedback,
  getRoomFeedback,
};

const { Room } = require("../models/Room");
const { SelfStudyArea } = require("../models/SelfStudyArea");
const { Feedback } = require("../models/Feedback");
const { v4: uuidv4 } = require("uuid");

const getAllRoomType = async () => {
  var roomType = await Room.aggregate("type", "DISTINCT", {
    plain: false,
  }).then((roomTypeList) => {
    return roomTypeList.map((item) => Object.values(item)[0]);
  });

  return roomType;
};

const getRoomListBySsaIdAndRoomType = async ({ roomType, ssaId }) => {
  var roomList = await Room.findAll({
    where: {
      ssaId: ssaId,
      type: roomType,
    },
    include: [
      {
        model: SelfStudyArea,
        attributes: ["building"],
      },
    ],
    order: [["name", "ASC"]],
  });

  roomList = roomList.map((room) => {
    return {
      id: room.id,
      ssaId: room.ssaId,
      name: room.name,
      capacity: room.capacity,
      type: room.type,
      floor: room.floor,
      building: room.SelfStudyArea.building,
    };
  });

  return roomList;
};

const getRoomDetailById = async ({ id }) => {
  var roomDetail = await Room.findOne({
    where: {
      id,
    },
    include: [
      {
        model: SelfStudyArea,
        attributes: ["building"],
      },
    ],
  });
  return {
    id: roomDetail.id,
    ssaId: roomDetail.ssaId,
    name: roomDetail.name,
    capacity: roomDetail.capacity,
    type: roomDetail.type,
    floor: roomDetail.floor,
    building: roomDetail.SelfStudyArea.building,
  };
};

const createRoomFeedback = async ({ roomId, content, studentId }) => {
  return await Feedback.create({
    id: uuidv4(),
    roomId: roomId,
    studentId: studentId,
    content: content,
    createdAt: new Date().getTime(),
  });
};

const getRoomFeedbackByRoomId = async ({ roomId }) => {
  return await Feedback.findAll({
    where: {
      roomId: roomId,
    },
    order: [["createdAt", "DESC"]],
  });
};

module.exports = {
  getAllRoomType,
  getRoomListBySsaIdAndRoomType,
  getRoomDetailById,
  createRoomFeedback,
  getRoomFeedbackByRoomId,
};

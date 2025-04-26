const { SelfStudyArea } = require("../models/SelfStudyArea");

const getAllSelfStudyArea = async (req, res) => {
  try {
    const ssaList = await SelfStudyArea.findAll({
      order: [["building", "ASC"]],
    });
    res.json({
      success: true,
      data: ssaList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { getAllSelfStudyArea };

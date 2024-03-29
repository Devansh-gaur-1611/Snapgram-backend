const Joi = require("joi");
const User = require("../../models/user");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

const isUser = async (req, res, next) => {
  const userId = req.pathType == 1 ? req.userId : req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const response = {
      id: user._id,
      full_name: user.name,
      userName: user.userName,
      profileImageUrl: user.profileImageUrl,
    };
    return res.status(200).json({ user: response, status: "ok" });
  } catch (error) {
    CustomErrorHandler.consoleError(error);
    return next(CustomErrorHandler.serverError());
  }
};

module.exports = isUser;

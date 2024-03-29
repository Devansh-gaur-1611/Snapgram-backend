const Joi = require("joi");
const User = require("../../models/user");
const CustomErrorHandler = require("../../services/CustomErrorHandler");
const Follow = async (req, res, next) => {
  const schema = Joi.object({
    followUserId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
    status: Joi.boolean().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return next(CustomErrorHandler.badRequest());
  }

  const { followUserId, status } = req.body;
  const userId = req.pathType == 1 ? req.userId : req.user.id;

  try {
    const user = await User.findOne({ _id: userId });
    const followUser = await User.findOne({ _id: followUserId });

    if (user && followUser) {
      if (status === true) {
        User.findByIdAndUpdate(userId, { $addToSet: { following: followUserId } }, function (err, result) {
          if (err) {
            CustomErrorHandler.consoleError(err);
            return next(CustomErrorHandler.serverError());
          }
        });

        User.findByIdAndUpdate(followUserId, { $addToSet: { followers: userId } }, function (err, result) {
          if (err) {
            CustomErrorHandler.consoleError(err);
            return next(CustomErrorHandler.serverError());
          }
        });

        return res.status(200).json({ message: "User followed successfully!!" });
      } else {
        User.findByIdAndUpdate(userId, { $pull: { following: followUserId } }, function (err, result) {
          if (err) {
            CustomErrorHandler.consoleError(err);
            return next(CustomErrorHandler.serverError());
          }
        });

        User.findByIdAndUpdate({ _id: followUserId }, { $pull: { following: userId } }, function (err, result) {
          if (err) {
            CustomErrorHandler.consoleError(err);
            return next(CustomErrorHandler.serverError());
          }
        });

        return res.status(200).json({ message: "User unfollowed successfully" });
      }
    } else {
      return next(CustomErrorHandler.notFound());
    }
  } catch (err) {
    CustomErrorHandler.consoleError(err);
    return next(CustomErrorHandler.serverError());
  }
};

module.exports = Follow;

const Joi = require("joi");
const post = require("../../models/post");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

const like = async (req, res, next) => {
  const schema = Joi.object({
    postId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
    status: Joi.bool().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return next(CustomErrorHandler.badRequest());
  }
  const { postId, status } = req.body;
  const userId = req.pathType == 1 ? req.userId : req.user.id;

  try {
    const postExist = await post.exists({ _id: postId });
    if (!postExist) {
      return next(CustomErrorHandler.notFound("No such post found !!!"));
    }
    if (status === true) {
      await post.findOneAndUpdate({ _id: postId }, { $addToSet: { postLikeUsers: userId } });
      return res.status(200).json({ message: "Post has been liked !!!" });
    } else {
      await post.findOneAndUpdate({ _id: postId }, { $pull: { postLikeUsers: userId } });
      return res.status(200).json({ message: "Post has been disiked !!!" });
    }
  } catch (err) {
    CustomErrorHandler.consoleError(err)
    return next(CustomErrorHandler.serverError());
  }
};

module.exports = like;

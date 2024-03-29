const Joi = require("joi");
const Comment = require("../../models/comment");
const User = require("../../models/user");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

const createComment = async (req, res, next) => {
  const schema = Joi.object({
    postId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
    comment: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return next(CustomErrorHandler.badRequest());
  }

  const { postId, comment } = req.body;
  const userId = req.pathType == 1 ? req.userId : req.user.id;

  try {
    var doc = await Comment.create({ commentor: userId, post: postId, text: comment });
    doc = await Comment.findById(doc._id).populate("commentor", "userName profileImageUrl");
    const newComment = {
      id: doc._id,
      commentorId: userId,
      commentorUserName: doc.commentor.userName,
      profileImage: doc.commentor.profileImageUrl,
      text: comment,
      createdAt: doc.createdAt,
    };
    return res.status(201).json({ comment: newComment, message: "New comment created successfully" });
  } catch (e) {
    CustomErrorHandler.consoleError(e);
    return next(CustomErrorHandler.serverError());
  }
};

module.exports = createComment;

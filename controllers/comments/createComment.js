const Joi = require("joi");
const Comment = require("../../models/comment");
const Post = require("../../models/post");
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
    const postExist = await Post.exists({ _id: postId });
    if(postExist){
      var doc = await Comment.create({ commentor: userId, post: postId, text: comment });
      doc = await Comment.findById(doc._id).populate("commentor", "userName profileImageUrl");
      await Post.findByIdAndUpdate(postId,{ $inc: { postCommentsCount: 1 } })
      return res.status(201).json({ comment: doc, message: "New comment created successfully" });
    }else{
      return next(CustomErrorHandler.notFound("Post not found !!!"))
    }
    
  } catch (e) {
    CustomErrorHandler.consoleError(e);
    return next(CustomErrorHandler.serverError());
  }
};

module.exports = createComment;

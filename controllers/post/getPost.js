const Joi = require("joi");
const Post = require("../../models/post");
const User = require("../../models/user");
const Comment = require("../../models/comment");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

const getPost = async (req, res, next) => {
  const schema = Joi.object({
    size: Joi.string().required(),
    nextToken: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return next(CustomErrorHandler.badRequest());
  }
  try {
    const { size, nextToken } = req.query;
    const userId = req.pathType == 1 ? req.userId : req.user.id;

    var documents;
    if (nextToken && nextToken != null && nextToken != "null" && nextToken.length > 0) {
      var query = {
        _id: { $lt: nextToken },
      };
      documents = await Post.find(query).limit(size).populate("postUser", "name userName profileImageUrl");
    } else {
      documents = await Post.find().limit(size).populate("postUser", "name userName profileImageUrl");
    }

    if (!documents) {
      return next(CustomErrorHandler.notFound("No post available"));
    }

    const newDocument = await Promise.all(
      documents.map(async (doc) => {
        const resultDoc = {
          postId: doc._id,
          postFileUrl: doc.postFileUrl,
          postLikesCount: doc.postLikeUsers.length,
          postType: doc.postType,
          postCommentCount: doc.postCommentsCount,
          createdAt: Date.parse(doc.createdAt) / 1000,
          slug: doc.slug,
          status: doc.postLikeUsers.includes(userId),
          userName: doc.postUser.userName,
          userImage: doc.postUser.profileImageUrl,
        };

        return resultDoc;
      })
    );

    return res.status(200).json({ posts: newDocument, nextToken: newDocument.size === size ? newDocument[0].postId : null });
  } catch (e) {
    CustomErrorHandler.consoleError(e);
    return next(CustomErrorHandler.serverError());
  }
};

module.exports = getPost;

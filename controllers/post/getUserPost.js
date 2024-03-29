const Joi = require("joi");
const Post = require("../../models/post");
const User = require("../../models/user");
const Comment = require("../../models/comment");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

const getUserPosts = async (req, res, next) => {
  const schema = Joi.object({
    userName: Joi.string().required(),
    size: Joi.string().required(),
    nextToken: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/),
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return next(CustomErrorHandler.badRequest());
  }

  const { userName, size, nextToken } = req.query;

  try {
    const user = await User.findOne({ userName: userName });
    if (!user) {
      return next(CustomErrorHandler.notFound("No user with this username exists !!!"));
    }

    var documents;
    var query = {
      postUser: user._id,
    };
    if (nextToken && nextToken != null && nextToken != "null" && nextToken.length > 0) {
      query._id = { $lt: nextToken };
      documents = await Post.find(query).limit(size);
    } else {
      documents = await Post.find(query).limit(size);
    }

    if (!documents) {
      return next(CustomErrorHandler.notFound("No post for this user has been found !!!"));
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
        };
        return resultDoc;
      })
    );

    return res.status(200).json({ posts: newDocument, nextToken: newDocument.size === size ? newDocument[0].postId : null });
  } catch (error) {
    CustomErrorHandler.consoleError(error);
    return next(CustomErrorHandler.serverError());
  }
};

module.exports = getUserPosts;

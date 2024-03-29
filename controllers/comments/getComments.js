const Joi = require("joi");
const Comments = require("../../models/comment");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

const getComments = async (req, res, next) => {
  const schema = Joi.object({
    postId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    nextToken: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return next(CustomErrorHandler.badRequest());;
  }

  const { postId, nextToken } = req.query;
  const size = 10;

  try {
    var query = {
      postId: postId,
    };
    var documents;
    if (nextToken && nextToken != null && nextToken != "null" && nextToken.length > 0) {
      var query = {
        _id: { $lt: nextToken },
      };
      documents = await Comments.find(query).limit(size).populate("commentor", "userName profileImageUrl");
    } else {
      documents = await Comments.find(query).limit(size).populate("commentor", "userName profileImageUrl");
    }
    if (!documents) {
      return nextToken(CustomErrorHandler.notFound())
    }

    return res.status(200).json({ comments: documents });
  } catch (e) {
    CustomErrorHandler.consoleError(e)
    return next(CustomErrorHandler.serverError())
  }
};

module.exports = getComments;

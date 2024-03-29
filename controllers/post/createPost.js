const Joi = require("joi");
const user = require("../../models/user");
const post = require("../../models/post");
const { v4: uuidv4 } = require("uuid");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

const createPost = async (req, res, next) => {
  const postSchema = Joi.object({
    postFileUrl: Joi.string().required(),
    postType: Joi.string().required(),
  });

  const { error } = postSchema.validate(req.body);
  if (error) {
    return next(CustomErrorHandler.badRequest());
  }

  const userId = req.pathType == 1 ? req.userId : req.user.id;
  const { postFileUrl, postType } = req.body;

  post
    .create({ postUser: userId, postFileUrl, postType, slug: uuidv4() })
    .then(() => {
      return res.status(201).json({ message: "Post created successfully" });
    })
    .catch((error) => {
      CustomErrorHandler.consoleError(error);
      return next(CustomErrorHandler.serverError());
    });
};

module.exports = createPost;

const User = require("../../models/user");
const Post = require("../../models/post");
const Joi = require("joi");
const CustomErrorHandler = require("../../services/CustomErrorHandler");
const UserDetails = async (req, res, next) => {
  const schema = Joi.object({
    userName: Joi.string().required(),
  });

  const { error } = schema.validate(req.query);

  if (error) {
    return next(CustomErrorHandler.badRequest());
  }

  const { userName } = req.query;
  const viewerId = req.pathType == 1 ? req.userId : req.user.id;
  try {
    const user = await User.findOne({ userName: userName });
    if (!user) {
      return next(CustomErrorHandler.notFound("No such user found !!!"));
    }
    const follow_by_viewer = user.followers.includes(viewerId);
    const follow_viewer = user.following.includes(viewerId);
    const user_is_Viewer = user._id == viewerId ? true : false;

    const posts = await Post.find({ postUser: user._id });

    const response = {
      id: user._id,
      full_name: user.name,
      userName: userName,
      follow_by_viewer: follow_by_viewer,
      follow_viewer: follow_viewer,
      user_is_Viewer: user_is_Viewer,
      postCount: posts ? posts.length : 0,
      followers: user.followers,
      following: user.following,
      profileImageUrl: user.profileImageUrl,
    };

    return res.status(200).json({ user: response, status: "ok" });
  } catch (e) {
    return next(CustomErrorHandler.serverError());
  }
};

module.exports = UserDetails;

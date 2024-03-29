const Joi = require("joi");
const User = require("./../../models/user");
const Firebase = require("../../services/Firebase");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

const profileImage = {
  async uploadImage(req, res, next) {
    const schema = Joi.object({
      imageUrl: Joi.string().required(),
      oldImageUrl: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      console.log(error)
      return next(CustomErrorHandler.badRequest());
    }

    const { imageUrl, oldImageUrl } = req.body;
    const userId = req.pathType == 1 ? req.userId : req.user.id;
    const doc = await User.findOneAndUpdate({ _id: userId }, { profileImageUrl: imageUrl }, { new: true });

    if (doc.profileImageUrl == imageUrl) {
      if (oldImageUrl != " ") {
        try {
          Firebase.DeleteFileInFirebase(oldImageUrl);
        } catch (e) {
          console.log(e);
        }
      }
      return res.status(200).json({ message: "Profile Image updated successfully" });
    } else {
      return next(CustomErrorHandler.serverError())
    }
  },

  async removeImage(req, res, next) {
    const schema = Joi.object({
      oldImageUrl: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return next(CustomErrorHandler.badRequest());;
    }

    const { oldImageUrl } = req.body;
    const userId = req.pathType == 1 ? req.userId : req.user.id;
    const doc = await User.findOneAndUpdate({ _id: userId }, { profileImageUrl: "" }, { new: true });

    if (doc.profileImageUrl == "") {
      if (oldImageUrl != " ") {
        try {
          Firebase.DeleteFileInFirebase(oldImageUrl);
        } catch (e) {
          console.log(e);
        }
      }
      return res.status(200).json({ message: "Image removed successfully" });
    } else {
      return next(CustomErrorHandler.serverError())
    }
  },
};

module.exports = profileImage;

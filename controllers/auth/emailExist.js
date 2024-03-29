const joi = require("joi");
const User = require("../../models/user");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

const emailExist = async (req, res, next) => {
  const schema = joi.object({
    email: joi.string().email().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return next(CustomErrorHandler.badRequest());
  }

  try{const userExist = await User.findOne({ email: req.body.email });
  if (userExist) {
    return res.status(200).json({ message: true });
  }
  return res.status(200).json({ message: false });}catch(err){
    CustomErrorHandler.consoleError(err)
    return next(CustomErrorHandler.serverError());
  }
};

module.exports = emailExist;

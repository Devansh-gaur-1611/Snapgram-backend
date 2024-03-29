const Joi = require("joi");
const Status = require("../../models/status");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

const createStatus = async (req, res, next) => {
  const schema = Joi.object({
    fileUrl: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return next(CustomErrorHandler.badRequest());;
  }

  const { fileUrl } = req.body;
  const userId = req.pathType == 1 ? req.userId : req.user.id;
  try {
    await Status.create({ userId: userId, fileUrl: fileUrl });
    return res.status(201).json({ message: "Status created successfully." });
  } catch (err) {
    CustomErrorHandler.consoleError(err);
    return next(CustomErrorHandler.serverError());
  }
};

module.exports = createStatus;

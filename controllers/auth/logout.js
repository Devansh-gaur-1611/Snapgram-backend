const jwtService = require("../../services/JwtServices");
const joi = require("joi");
const RedisServices = require("../../services/RedisServices");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

const logout = async (req, res, next) => {
  if (req.pathType == 1) {
    const schema = joi.object({
      refresh_token: joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      next(CustomErrorHandler.badRequest());
    }
    try {
      const { id } = jwtService.verify(req.body.refresh_token, process.env.REFRESH_SECRET);
      RedisServices.createClient()
        .del(id)
        .then((ok) => {
          if (ok) {
            return res.status(204).json({ message: "Logout successfully." });
          }
        })
        .catch((err) => {
          return next(CustomErrorHandler.serverError())
        });
    } catch (e) {
      return next(CustomErrorHandler.serverError())
    }
  }else{
    // Case of OAuth Login
    console.log("logoutt")
    req.logout()
    return res.status(200).json({ message: "Logout successfully." });
  }
};

module.exports = logout;

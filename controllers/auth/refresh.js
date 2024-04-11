const jwtService = require("../../services/JwtServices");
const joi = require("joi");
const user = require("../../models/user");
const RedisServices = require("../../services/RedisServices");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

const refresh = async (req, res, next) => {
  const schema = joi.object({
    refresh_token: joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    next(CustomErrorHandler.badRequest());
  }
  const redisClient = RedisServices.createClient();

  try {
    let userId;
    const val = jwtService.verify(req.body.refresh_token, process.env.REFRESH_SECRET);
    if(val.error){
      return next(CustomErrorHandler.unAuthorized())
    }
    const { id } = val;
    userId = id;
    const resp = await redisClient.get(userId);
    if (resp == null) {
      return next(CustomErrorHandler.unAuthorized())
    }
    const access_token = jwtService.sign({ id: userId });
    return res.status(200).json({ access_token: access_token, refresh_token: req.body.refresh_token });
  } catch (err) {
    CustomErrorHandler.consoleError(err)
   return next(CustomErrorHandler.serverError())
  } finally {
    await redisClient.quit();
  }
};

module.exports = refresh;

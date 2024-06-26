const CustomErrorHandler = require("../services/CustomErrorHandler");
const jwtService = require("../services/JwtServices");

const auth = async (req, res, next) => {
  if (!req.user || req.user == {}) {
    const authHeader = req.headers.authorization;
    // console.log(req.headers)
    if (!authHeader) {
      return next(CustomErrorHandler.unAuthorized());
    }

    const token = authHeader.split(" ")[1];
    try {
      const val = jwtService.verify(token);
      if (val.error) {
        return next(CustomErrorHandler.unAuthorized());
      }
      const { id } = val;
      req.userId = id;
      req.pathType = 1; // path = 1 = jwt token
      next();
    } catch (e) {
      CustomErrorHandler.consoleError(e);
      return next(CustomErrorHandler.unAuthorized());
    }
  } else {
    req.pathType = 2; // 2 = oAuth
    next();
  }
};

module.exports = auth;

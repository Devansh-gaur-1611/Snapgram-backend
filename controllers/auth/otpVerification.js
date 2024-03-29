const Joi = require("joi");
const RedisServices = require("../../services/RedisServices");
const User = require("../../models/user");
const axios = require("axios");
const CustomErrorHandler = require("../../services/CustomErrorHandler");
const otpVerify = async (req, res, next) => {
  console.log("object")
  const otpSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.number().required(),
  });

  const { error } = otpSchema.validate(req.body);
  if (error) return next(CustomErrorHandler.badRequest());

  const { email, otp } = req.body;
  console.log(req.body)
  try {
    const redisClient = RedisServices.createClient();
    var resp;
    try {
      resp = await redisClient.get(email);
      console.log("OTP captured successfully from redis"); 
    } catch (err) {
      console.log("Error in getting otp from redis");
    } finally {
      await redisClient.quit();
    }

    if (resp == otp) {
      const response = await User.findOneAndUpdate({ email: email }, { isVerified: true });
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const data = {
        email: email,
        subject: "Your account has been verified",
        username: response.userName,
        company: "Tech Developers",
      };
      axios
        .post(process.env.EMAIL_API_URL + "api/success", data, config)
        .then((res) => {
          console.log("Mail sent successfully !!!");
        })
        .catch((err) => {
          console.log("error in sending mail to :" + email);
        });
      return res.status(200).json({ message: "Your account has been verified !!!" });
    } else {
      return next(CustomErrorHandler.wrongCredentials("Invalid OTP !!!"));
    }
  } catch (e) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = otpVerify;

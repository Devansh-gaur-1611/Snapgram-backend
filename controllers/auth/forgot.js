const Joi = require("joi");
const User = require("../../models/user");
const axios = require("axios");
const RedisService = require("../../services/RedisServices");
const RedisServices = require("../../services/RedisServices");
const bcrypt = require("bcrypt");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

const Forgot = {
  async ForgotPassword(req, res, next) {
    const forgotSchema = Joi.object({
      email: Joi.string().email().required(),
    });

    const { error } = forgotSchema.validate(req.body);
    if (error) {
      return next(CustomErrorHandler.badRequest());
    }

    try {
      const { email } = req.body;
      const userExist = await User.findOne({ email: email });
      if (userExist) {
        const otp = generateOtpCode();
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        // sending mail to user
        let success;
        const data = {
          email: email,
          subject: "Password Reset",
          username: userExist.userName,
          otp: otp,
          company: "Tech Developers",
        };
        await axios
          .post(process.env.EMAIL_API_URL + "api/password-reset", data, config)
          .then((res) => {
            success = true;
            console.log("Mail sent successfully");
          })
          .catch((err) => {
            success = false;
            CustomErrorHandler.consoleError(err);
            console.log("error in sending mail to :" + email);
          });
        if (success) {
          // set the otp in redis
          const redisClient = RedisServices.createClient();
          try {
            const ttl = 60 * 10; // for 10 mins
            await redisClient.set(email, otp, "EX", ttl);
            console.log("OTP set successfully in Redis");
          } catch (error) {
            CustomErrorHandler.consoleError(error);
            return next(CustomErrorHandler.serverError());
          } finally {
            await redisClient.quit();
          }
        } else {
          // discord.SendErrorMessageToDiscord(email, "OTP SEND", "error in setup the otp in redis !!");
          console.log("Error in sending the mail");
          return next(CustomErrorHandler.serverError());
        }
        return res.status(200).json({ message: "OTP sent successfully" });
      } else {
        return next(CustomErrorHandler.notFound("No such user exists !!!"));
      }
    } catch (error) {
      CustomErrorHandler.consoleError(error);
      return next(CustomErrorHandler.serverError());
    }
  },

  async ResetPassword(req, res, next) {
    const resetSchema = Joi.object({
      email: Joi.string().email().required(),
      otp: Joi.number().required(),
      password: Joi.string().required(),
    });

    const { error } = resetSchema.validate(req.body);
    if (error) {
      return next(CustomErrorHandler.badRequest());
    }

    const { email, password, otp } = req.body;
    try {
      RedisServices.createClient()
        .get(email)
        .then(async (response) => {
          if (response == otp) {
            const hashedPassword = await bcrypt.hash(password, 12);
            User.findOneAndUpdate({ email: email }, { password: hashedPassword })
              .then((result) => {
                return res.status(200).json({ message: "Password reset successfully" });
              })
              .catch((error) => {
                CustomErrorHandler.consoleError(error);
                return next(CustomErrorHandler.serverError());
              });
          } else {
            return next(CustomErrorHandler.badRequest("Invalid OTP !!!"));
          }
        })
        .catch((err) => {
          CustomErrorHandler.consoleError(err);
          return next(CustomErrorHandler.serverError());
        });
    } catch (error) {
      CustomErrorHandler.consoleError(error);
      return next(CustomErrorHandler.serverError());
    }
  },

  async ChangePassword(req, res, next) {
    const changePasswordSchema = Joi.object({
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
    });

    const { error } = changePasswordSchema.validate(req.body);
    if (error) {
      return next(CustomErrorHandler.badRequest());
    }
    // console.log(req.body)
    const { oldPassword, newPassword } = req.body;
    const userId = req.pathType === 1 ? req.userId : req.user.id;
    try {
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      const user = await User.findById(userId);
      if (user != null) {
        const isCorrect = await bcrypt.compare(oldPassword, user.password);
        if (isCorrect) {
          await User.findByIdAndUpdate(userId, { password: hashedNewPassword });
          return res.status(200).json({ message: "Password changed successfully" });
        } else {
          return next(CustomErrorHandler.badRequest("Invalid old password !!!"));
        }
      } else {
        return next(CustomErrorHandler.notFound("User not found !!!"));
      }
    } catch (error) {
      console.log(error);
      return next(CustomErrorHandler.serverError());
    }
  },
};

const generateOtpCode = () => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return randomNumber;
};

module.exports = Forgot;

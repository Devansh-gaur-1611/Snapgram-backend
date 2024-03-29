const express = require("express");
const router = express.Router();
const bycrypt = require("bcrypt");
const Joi = require("joi");
const User = require("../../models/user");
const RedisService = require("../../services/RedisServices");
const axios = require("axios");
const CustomErrorHandler = require("../../services/CustomErrorHandler");
const RedisServices = require("../../services/RedisServices");

const registerUser = async (req, res, next) => {
  const userSchema = Joi.object({
    name: Joi.string().required(),
    userName: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
  });

  const { error } = userSchema.validate(req.body);
  if (error) {
    console.log(error);
    return next(CustomErrorHandler.badRequest());;
  }

  try {
    const { name, userName, email, password } = req.body;
    if (!email.includes("@")) {
      return res.status(400).json({ error: "Entered email address is not a valid email address." });
    }

    const isEmailExist = await User.exists({ email: email });
    if (isEmailExist) {
      return res.status(400).json({ error: "This user already exists." });
    }
    const isUserNameExist = await User.exists({ userName: userName });
    if (isUserNameExist) {
      return res.status(400).json({ error: "This UserName already exists." });
    }

    const hashedPassword = await bycrypt.hash(password, 12);
    User.create({ name: name, userName: userName, email: email, password: hashedPassword })
      .then(async () => {
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
          subject: "Verify your email address",
          username: userName,
          otp: otp,
          company: "Tech Developers",
        };
        await axios
          .post(process.env.EMAIL_API_URL + "api/mail-verify", data, config)
          .then((res) => {
            success = true;
            console.log("Mail sent successfully !!!")
          })
          .catch((err) => {
            success = false;
            CustomErrorHandler.consoleError(err)
            console.log("error in sending mail to :" + email);
          });
        if (success) {
          // set the otp in redis
          const ttl = 60 * 10; // for 10 mins
          const redisClient = RedisServices.createClient()
          try{
            await redisClient.set(email, otp, "EX", ttl)
            console.log("OTP set successfully in Redis")
          }catch(error){
            CustomErrorHandler.consoleError(error)
          }finally{
            await redisClient.quit()
          }
          
        } else {
          // discord.SendErrorMessageToDiscord(email, "OTP SEND", "error in setup the otp in redis !!");
          console.log("Error in sending mail to :" + email);
          // return res.status(500).json({ error: "Internal Server Error" });
        }
        return res.status(201).json({ message: "User created successfully" });
      })
      .catch((err) => {
        return next(CustomErrorHandler.serverError())
      });
  } catch (err) {
    return next(CustomErrorHandler.serverError())
  }
};

const generateOtpCode = () => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return randomNumber;
};

module.exports = registerUser;

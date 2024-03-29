const express = require("express");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const User = require("../../models/user");
const jwtServices = require("../../services/JwtServices");
const refreshSecret = process.env.REFRESH_SECRET;
const RedisServices = require("../../services/RedisServices");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

const login = async (req, res, next) => {
  const userSchema = Joi.object({
    email: Joi.string().required(), //This email can be username or phonenumber also
    password: Joi.string().required(),
  });

  const { error } = userSchema.validate(req.body);

  if (error) {
    next(CustomErrorHandler.badRequest());
  }

  try {
    let user = await User.findOne({ email: req.body.email });
    // Incase email  field is filled with username
    if (user == null) {
      user = await User.findOne({ userName: req.body.email });
    }

    if (user) {
      await bcrypt
        .compare(req.body.password, user.password)
        .then((isCorrect) => {
          if (isCorrect) {
            const id = user._id;
            const access_token = jwtServices.sign({ id: id });
            const refresh_token = jwtServices.sign({ id: id }, "7d", refreshSecret);

            const ttl = 60 * 60 * 24 * 7;
            RedisServices.createClient()
              .set(id, refresh_token, "ex", ttl)
              .then((ok) => {
                if (!ok) {
                  console.log("Error in setting up refresh in redis service")
                  return next(CustomErrorHandler.serverError())
                }
              })
              .catch((error) => {
                CustomErrorHandler.consoleError(error)
                return next(CustomErrorHandler.serverError())
              });
            return res.status(200).json({ id, access_token, refresh_token });
          } else {
            return next(CustomErrorHandler.wrongCredentials())
          }
        })
        .catch((error) => {
          console.log(error);
          return next(CustomErrorHandler.serverError())
        });
    } else {
      return next(CustomErrorHandler.wrongCredentials())
    }
  } catch (err) {
    CustomErrorHandler.consoleError(err)
    return next(CustomErrorHandler.serverError())
  }
};

module.exports = login;

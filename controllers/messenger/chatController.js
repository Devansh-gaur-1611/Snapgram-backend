const Chat = require("../../models/chatModel");
const Joi = require("joi");
const RedisServices = require("../../services/RedisServices");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

const ChatController = {
  async fetchOne2OneChats(req, res, next) {
    const schema = Joi.object({
      userId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      next(CustomErrorHandler.badRequest());
    }

    const { userId } = req.body;
    const currUserId = req.pathType == 1 ? req.userId : req.user.id;
    try {
      var chat = await Chat.findOne({
        isGroupChat: false,
        $and: [
          {
            users: { $elemMatch: { $eq: currUserId } },
          },
          {
            users: { $elemMatch: { $eq: userId } },
          },
        ],
      })
        .populate("users", "-password")
        .populate("latestMessage");
      if (chat && Object.keys(chat).length > 0) {
        return res.status(200).json({ data: chat });
      } else {
        const newChat = {
          users: [currUserId, userId],
          isGroupChat: false,
          chatName: "sender",
        };

        const createdChat = await Chat.create(newChat);
        const updatedChat = await Chat.findById(createdChat._id).populate("users", "-password");
        return res.status(200).json({ data: updatedChat });
      }
    } catch (err) {
      CustomErrorHandler.consoleError(err);
      return next(CustomErrorHandler.serverError());
    }
  },

  async fetchAllChats(req, res, next) {
    const userId = req.pathType == 1 ? req.userId : req.user.id;
    try {
      const doc = await Chat.find({ users: { $elemMatch: { $eq: userId } } })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 });
      const redisClientStatus = RedisServices.createClientStatus();
      const unReadCount = await redisClientStatus.hgetall(userId);
      if (unReadCount === undefined || unReadCount == null) {
        unReadCount = {};
      }
      await redisClientStatus.quit();

      return res.status(200).json({ data: doc, unReadMap: unReadCount });
    } catch (error) {
      CustomErrorHandler.consoleError(error);
      return next(CustomErrorHandler.serverError());
    }
  },

  async createGroupChat(req, res, next) {
    const schema = Joi.object({
      users: Joi.array()
        .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
        .min(2)
        .required(),
      chatName: Joi.string().required(),
    });
    const { error } = schema.validate(res.body);
    if (error) {
      return next(CustomErrorHandler.badRequest());
    }
    const users = req.body.users;
    const currUserId = req.pathType == 1 ? req.userId : req.user.id;
    users.push(currUserId);
    try {
      const newChat = {
        users: users,
        isGroupChat: true,
        chatName: req.body.chatName,
        groupAdmin: currUserId,
      };

      const grpChat = await Chat.create(newChat);
      const popChat = await Chat.findById(grpChat._id).populate("users", "-password").populate("groupAdmin", "-password");
      return res.status(201).json({ data: popChat });
    } catch (err) {
      CustomErrorHandler.consoleError(err);
      return next(CustomErrorHandler.serverError());
    }
  },

  async fetchChatDetails(req, res, next) {
    const schema = Joi.object({
      id: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    });

    const { error } = schema.validate(req.query);
    if (error) {
      return next(CustomErrorHandler.badRequest());
    }
    const { id } = req.query;
    try {
      chatDoc = await Chat.findById(id).populate("users", "-password").populate("groupAdmin", "-password");
      return res.status(200).json({ data: chatDoc });
    } catch (err) {
      CustomErrorHandler.consoleError(err);
      return next(CustomErrorHandler.serverError());
    }
  },

  async renameGroupChat(req, res, next) {
    const schema = Joi.object({
      chatId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
      name: Joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return next(CustomErrorHandler.badRequest());
    }
    const { chatId, name } = req.body;

    try {
      const updatedChat = await Chat.findOneAndUpdate({ _id: chatId }, { $set: { chatName: name } }, { new: true })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
      return res.status(200).json({ data: updatedChat });
    } catch (error) {
      CustomErrorHandler.consoleError(error);
      return next(CustomErrorHandler.serverError());
    }
  },

  async addUserToGroup(req, res, next) {
    const schema = Joi.object({
      chatId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
      userId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return next(CustomErrorHandler.badRequest());
    }
    const { chatId, userId } = req.body;
    try {
      const added = await Chat.findOneAndUpdate({ _id: chatId }, { $addToSet: { users: userId } }, { new: true })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

      return res.status(200).json({ data: added });
    } catch (error) {
      CustomErrorHandler.consoleError(error);
      return next(CustomErrorHandler.serverError());
    }
  },

  async removeUserFromGroup(req, res, next) {
    const schema = Joi.object({
      chatId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
      userId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return next(CustomErrorHandler.badRequest());
    }
    const { chatId, userId } = req.body;
    try {
      const removed = await Chat.findOneAndUpdate({ _id: chatId }, { $pull: { users: userId } }, { new: true })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
      return res.status(200).json({ data: removed });
    } catch (error) {
      CustomErrorHandler.consoleError(error);
      return next(CustomErrorHandler.serverError());
    }
  },
};

module.exports = ChatController;

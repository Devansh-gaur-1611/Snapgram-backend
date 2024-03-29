const joi = require("joi");
const Message = require("../../models/messageModel");
const Chat = require("../../models/chatModel");
const RedisServices = require("../../services/RedisServices");
const Joi = require("joi");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

const MessageController = {
  async allMessages(req, res, next) {
    const schema = Joi.object({
      chatId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    });
    const { error } = schema.validate(req.params);
    if (error) {
      return next(CustomErrorHandler.badRequest());
    }
    const qSchema = Joi.object({
      cursor: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    });
    const qError = qSchema.validate(req.query).error;
    if (qError) {
      next(CustomErrorHandler.badRequest());
    }
    try {
      const userId = req.pathType == 1 ? req.userId : req.user.id;
      const chatId = req.params.chatId;
      const { cursor } = req.query;
      let doc;
      let query = {
        chatId: chatId,
      };
      // console.log(cursor);
      if (cursor && cursor != null && cursor != "null" && cursor.length > 0) {
        query._id = { $lt: cursor };
        doc = await Message.find(query).sort({ _id: -1 }).limit(10).populate("sender", "-password").populate("chat");
      } else {
        const count = await RedisServices.getUserStatus(userId, chatId);
        doc = await Message.find(query)
          .sort({ _id: -1 })
          .limit(10 + count)
          .populate("sender", "-password")
          .populate("chat");
        // doc = await doc.reverse();
        if (count > 0) {
          await RedisServices.setUserStatus(userId, chatId, 0);
        }
      }

      doc = doc.map((obj) => ({
        ...obj._doc,
        isSender: userId == obj.sender._id,
      }));
      return res.status(200).json({ data: doc, cursor: doc.length == 10 ? doc[0]._id : null });
    } catch (err) {
      CustomErrorHandler.consoleError(err);
      return next(CustomErrorHandler.serverError());
    }
  },
  async sendMessage(req, res, next) {
    const schema = Joi.object({
      chatId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
      content: Joi.string().min(1).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return next(CustomErrorHandler.badRequest());
    }
    const { content, chat } = req.body;
    const userId = req.pathType == 1 ? req.userId : req.user.id;
    const newMessage = {
      sender: userId,
      content,
      chat,
    };
    try {
      var message = await Message.create(newMessage);
      message = await message.populate("sender", "-password")
      message = await message.populate("chat")
      message = await message.populate("chat.users", "name pic email")
      message = { ...message._doc, isSender: true };

      await Chat.findByIdAndUpdate(chat, { latestMessage: message._id });
      return res.status(201).json({ data: message, message: "Message created successfully !!!" });
    } catch (error) {
      CustomErrorHandler.consoleError(error);
      return next(CustomErrorHandler.serverError());
    }
  },
};

module.exports = MessageController;

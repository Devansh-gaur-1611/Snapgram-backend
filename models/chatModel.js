// Define chat is between who and whom

const mongoose = require("mongoose");
const ChatSchema = mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    chatName: { type: "string" },
    isGroupChat: { type: "boolean", default: false },
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);


const Chat = mongoose.model("Chat", ChatSchema);
module.exports = Chat;
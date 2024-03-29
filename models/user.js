const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: "string", required: true },
    userName: { type: "string", required: true },
    email: { type: "string", required: true },
    profileImageUrl: { type: "string", default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" },
    password: { type: "string", default: null },
    followers: { type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ], default: [] },
    following: { type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ], default: [] },
    googleId: { type: "string", default: null },
    isVerified: { type: "boolean", default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    postUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postFileUrl: { type: "string", required: true },
    postLikeUsers: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
    postCommentsCount: { type: "Number", default: 0 },
    postType: { type: "string", required: true },
    slug: { type: "string", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);

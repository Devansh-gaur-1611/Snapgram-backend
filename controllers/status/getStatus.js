const Joi = require("joi");
const Status = require("../../models/status");
const User = require("../../models/user");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

const getStatus = async (req, res, next) => {
  const userId = req.pathType == 1 ? req.userId : req.user.id;
  const user = await User.findOne({ _id: userId });
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  try {
    following = user.following;
    following = [userId, ...following];
    let resDoc = [];
    for (const id of following) {
      const document = await Status.find({ userId: id });
      if (document && document.length > 0) {
        const user_info = await User.findOne({ _id: id });
        if (user_info) {
          resultObj = {
            userId: id,
            userName: user_info.userName,
            profileImage: user_info.profileImageUrl,
          };
          statusFilesUrl = [];
          for (const doc of document) {
            statusFilesUrl.push(doc.fileUrl);
          }
          resultObj = { ...resultObj, statusUrls: statusFilesUrl };
          resDoc.push(resultObj);
        }
      }
    }

    return res.status(200).json({ status: resDoc });
  } catch (err) {
    CustomErrorHandler.consoleError(err);
    return next(CustomErrorHandler.serverError());
  }
};

module.exports = getStatus;

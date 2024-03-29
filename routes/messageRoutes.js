const express = require("express");
const MessageController = require("../controllers/messenger/messageController");
const protect = require("../middleware/auth");

const router = express.Router();

router.route("/:chatId").get(protect, MessageController.allMessages);
router.route("/").post(protect, MessageController.sendMessage);

module.exports = router;
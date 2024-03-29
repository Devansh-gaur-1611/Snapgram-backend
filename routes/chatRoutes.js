const express = require("express");
const ChatController = require("../controllers/messenger/chatController");
const auth  = require("../middleware/auth");

const router = express.Router()

router.post("/",[auth], ChatController.fetchOne2OneChats);
router.get("/",[auth], ChatController.fetchAllChats);
router.get("/getOne",[auth], ChatController.fetchChatDetails)
router.post("/group",[auth], ChatController.createGroupChat);
router.put("/rename",auth, ChatController.renameGroupChat);
router.put("/groupremove",auth, ChatController.removeUserFromGroup);
router.put("/groupadd",auth, ChatController.addUserToGroup);

module.exports = router;
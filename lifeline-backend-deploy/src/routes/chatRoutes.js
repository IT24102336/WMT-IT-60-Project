const express = require("express");

const { sendChatReply } = require("../controllers/chatController");

const router = express.Router();

router.post("/", sendChatReply);

module.exports = router;

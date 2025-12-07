const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { chatWithAI, getChatHistory, deleteChatHistory } = require("../controllers/chatController");

const router = express.Router();

router.post("/", protect, chatWithAI);
router.get("/", protect, getChatHistory);
router.delete("/", protect, deleteChatHistory);

module.exports = router;

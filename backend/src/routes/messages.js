import express from "express";
import {
  getMessages,
  getGroupMessages,
  sendMessage,
  getConversations,
  markAsDelivered,
} from "../controllers/messageController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getConversations);
router.get("/group/:groupId", getGroupMessages);
router.get("/:userId", getMessages);
router.post("/", sendMessage);
router.put("/deliver", markAsDelivered);

export default router;

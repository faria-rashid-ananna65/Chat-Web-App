import express from "express";
import {
  getFriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingRequests,
  removeFriend,
} from "../controllers/friendController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getFriends);
router.get("/requests", getPendingRequests);
router.post("/request", sendFriendRequest);
router.put("/accept", acceptFriendRequest);
router.put("/reject", rejectFriendRequest);
router.delete("/remove", removeFriend);

export default router;

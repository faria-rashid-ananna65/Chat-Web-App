import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import Conversation from "../models/Conversation.js";

export const getFriends = async (req, res) => {
  try {
    const friendRequests = await FriendRequest.find({
      $or: [
        { sender: req.user._id, status: "accepted" },
        { receiver: req.user._id, status: "accepted" },
      ],
    }).populate("sender receiver", "fullName avatar isOnline lastSeen phoneNumber");

    const friends = friendRequests.map((request) => {
      return request.sender._id.toString() === req.user._id.toString()
        ? request.receiver
        : request.sender;
    });

    res.json(friends);
  } catch (error) {
    console.error("GetFriends error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const receiver = await User.findOne({ email: email.toLowerCase() });
    if (!receiver) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    if (receiver._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot add yourself as a friend" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.user._id, receiver: receiver._id },
        { sender: receiver._id, receiver: req.user._id },
      ],
    });

    if (existingRequest) {
      if (existingRequest.status === "accepted") {
        return res.status(400).json({ message: "Already friends" });
      }
      return res.status(400).json({ message: "Friend request already exists" });
    }

    await FriendRequest.create({ sender: req.user._id, receiver: receiver._id });

    res.status(201).json({ message: "Friend request sent" });
  } catch (error) {
    console.error("SendFriendRequest error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required" });
    }

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, friendRequest.sender] },
    });
    if (!conversation) {
      await Conversation.create({
        participants: [req.user._id, friendRequest.sender],
      });
    }

    res.json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("AcceptFriendRequest error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required" });
    }

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    friendRequest.status = "rejected";
    await friendRequest.save();

    res.json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("RejectFriendRequest error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiver: req.user._id,
      status: "pending",
    }).populate("sender", "fullName avatar email");

    res.json(requests);
  } catch (error) {
    console.error("GetPendingRequests error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({ message: "Friend ID is required" });
    }

    await FriendRequest.findOneAndDelete({
      $or: [
        { sender: req.user._id, receiver: friendId },
        { sender: friendId, receiver: req.user._id },
      ],
    });

    res.json({ message: "Friend removed" });
  } catch (error) {
    console.error("RemoveFriend error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.find({
      $or: [
        { email: { $regex: query, $options: "i" } },
        { fullName: { $regex: query, $options: "i" } },
      ],
      _id: { $ne: req.user._id },
    }).select("fullName avatar email");

    res.json(users);
  } catch (error) {
    console.error("SearchUsers error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

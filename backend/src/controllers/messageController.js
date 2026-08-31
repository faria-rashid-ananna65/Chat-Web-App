import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import Group from "../models/Group.js";

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("sender", "fullName avatar");

    await Message.updateMany(
      { sender: userId, receiver: req.user._id, seen: false },
      { seen: true, seenAt: new Date() }
    );

    res.json(messages.reverse());
  } catch (error) {
    console.error("GetMessages error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    const messages = await Message.find({ group: groupId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("sender", "fullName avatar");

    res.json(messages.reverse());
  } catch (error) {
    console.error("GetGroupMessages error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiver, group, content, messageType, fileUrl } = req.body;

    if (!content && !fileUrl) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      group,
      content,
      messageType: messageType || "text",
      fileUrl,
    });

    if (receiver) {
      let conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, receiver] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [req.user._id, receiver],
        });
      }

      conversation.lastMessage = message._id;
      await conversation.save();
    }

    if (group) {
      await Group.findByIdAndUpdate(group, { lastMessage: message._id });
    }

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "fullName avatar"
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("SendMessage error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "fullName avatar isOnline lastSeen")
      .populate({ path: "lastMessage", populate: { path: "sender", select: "fullName" } })
      .sort({ updatedAt: -1 });

    const formattedConversations = conversations.map((conv) => {
      const friend = conv.participants.find(
        (p) => p._id.toString() !== req.user._id.toString()
      );
      const unreadCount = conv.unreadCount.get(req.user._id.toString()) || 0;

      return {
        _id: friend._id,
        fullName: friend.fullName,
        avatar: friend.avatar,
        isOnline: friend.isOnline,
        lastSeen: friend.lastSeen,
        lastMessage: conv.lastMessage,
        unreadCount,
        updatedAt: conv.updatedAt,
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error("GetConversations error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const markAsDelivered = async (req, res) => {
  try {
    const { messageIds } = req.body;

    await Message.updateMany(
      { _id: { $in: messageIds } },
      { delivered: true }
    );

    res.json({ message: "Messages marked as delivered" });
  } catch (error) {
    console.error("MarkAsDelivered error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

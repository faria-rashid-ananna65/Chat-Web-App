import Group from "../models/Group.js";
import Message from "../models/Message.js";

export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    if (!members || members.length === 0) {
      return res.status(400).json({ message: "At least one member is required" });
    }

    if (members.length > 49) {
      return res.status(400).json({ message: "Maximum 50 members allowed" });
    }

    const group = await Group.create({
      name,
      admin: req.user._id,
      members: [req.user._id, ...members],
    });

    const populatedGroup = await Group.findById(group._id)
      .populate("admin", "fullName avatar")
      .populate("members", "fullName avatar isOnline lastSeen");

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("CreateGroup error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate("admin", "fullName avatar")
      .populate("members", "fullName avatar isOnline lastSeen")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error("GetGroups error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate("admin", "fullName avatar")
      .populate("members", "fullName avatar isOnline lastSeen");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.some((m) => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    res.json(group);
  } catch (error) {
    console.error("GetGroup error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { name, image } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can update the group" });
    }

    if (name) group.name = name;
    if (image) group.image = image;

    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate("admin", "fullName avatar")
      .populate("members", "fullName avatar isOnline lastSeen");

    res.json(updatedGroup);
  } catch (error) {
    console.error("UpdateGroup error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can delete the group" });
    }

    await Message.deleteMany({ group: group._id });
    await Group.findByIdAndDelete(group._id);

    res.json({ message: "Group deleted" });
  } catch (error) {
    console.error("DeleteGroup error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const addMembers = async (req, res) => {
  try {
    const { members } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can add members" });
    }

    if (group.members.length + members.length > 50) {
      return res.status(400).json({ message: "Maximum 50 members allowed" });
    }

    members.forEach((memberId) => {
      if (!group.members.includes(memberId)) {
        group.members.push(memberId);
      }
    });

    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate("admin", "fullName avatar")
      .populate("members", "fullName avatar isOnline lastSeen");

    res.json(updatedGroup);
  } catch (error) {
    console.error("AddMembers error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can remove members" });
    }

    if (memberId === group.admin.toString()) {
      return res.status(400).json({ message: "Cannot remove the admin" });
    }

    group.members = group.members.filter((m) => m.toString() !== memberId);
    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate("admin", "fullName avatar")
      .populate("members", "fullName avatar isOnline lastSeen");

    res.json(updatedGroup);
  } catch (error) {
    console.error("RemoveMember error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

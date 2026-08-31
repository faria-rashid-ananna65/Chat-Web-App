import { Server } from "socket.io";
import User from "../models/User.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import Group from "../models/Group.js";

const onlineUsers = new Map();

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL
        ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
        : "http://localhost:5173",
      credentials: true,
    },
    transports: ["polling", "websocket"],
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.on("connection", async (socket) => {


    const userId = socket.handshake.query.userId;

    if (userId) {
      onlineUsers.set(userId, socket.id);

      User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date(),
      }).catch((err) => console.error("Online status update error:", err.message));

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    }

    socket.on("joinRoom", ({ roomId }) => {
      socket.join(roomId);
    });

    socket.on("leaveRoom", ({ roomId }) => {
      socket.leave(roomId);
    });

    socket.on("privateMessage", async (data) => {
      try {
        const { sender, receiver, content, messageType, fileUrl } = data;

        const message = await Message.create({
          sender,
          receiver,
          content,
          messageType: messageType || "text",
          fileUrl,
        });

        let conversation = await Conversation.findOne({
          participants: { $all: [sender, receiver] },
        });

        if (!conversation) {
          conversation = await Conversation.create({
            participants: [sender, receiver],
          });
        }

        conversation.lastMessage = message._id;

        const currentCount = conversation.unreadCount.get(receiver) || 0;
        conversation.unreadCount.set(receiver, currentCount + 1);

        await conversation.save();

        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "fullName avatar")
          .lean();

        const receiverSocket = onlineUsers.get(receiver);
        if (receiverSocket) {
          io.to(receiverSocket).emit("receiveMessage", populatedMessage);
          Message.findByIdAndUpdate(message._id, { delivered: true }).catch(
            (err) => console.error("Deliver update error:", err.message)
          );
        }

        socket.emit("messageSent", populatedMessage);
      } catch (error) {
        console.error("Private message error:", error.message);
        socket.emit("messageError", { error: "Failed to send message" });
      }
    });

    socket.on("groupMessage", async (data) => {
      try {
        const { sender, group, content, messageType, fileUrl } = data;

        const message = await Message.create({
          sender,
          group,
          content,
          messageType: messageType || "text",
          fileUrl,
        });

        await Group.findByIdAndUpdate(group, { lastMessage: message._id });

        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "fullName avatar")
          .lean();

        io.to(`group_${group}`).emit("receiveGroupMessage", populatedMessage);
      } catch (error) {
        console.error("Group message error:", error.message);
        socket.emit("messageError", { error: "Failed to send message" });
      }
    });

    socket.on("typing", ({ roomId, userId }) => {
      socket.to(roomId).emit("userTyping", { userId });
    });

    socket.on("stopTyping", ({ roomId, userId }) => {
      socket.to(roomId).emit("userStopTyping", { userId });
    });

    socket.on("messageSeen", async ({ messageIds, senderId }) => {
      try {
        Message.updateMany(
          { _id: { $in: messageIds } },
          { seen: true, seenAt: new Date() }
        ).catch((err) => console.error("Seen update error:", err.message));

        const senderSocket = onlineUsers.get(senderId);
        if (senderSocket) {
          io.to(senderSocket).emit("messagesSeen", { messageIds });
        }
      } catch (error) {
        console.error("Message seen error:", error.message);
      }
    });

    socket.on("friendRequest", ({ receiverId, sender }) => {
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit("friendRequestReceived", { sender });
      }
    });

    socket.on("groupCreated", ({ memberIds, group }) => {
      memberIds.forEach((memberId) => {
        const memberSocket = onlineUsers.get(memberId);
        if (memberSocket) {
          io.to(memberSocket).emit("groupCreatedNotification", { group });
        }
      });
    });

    socket.on("disconnect", async () => {


      if (userId) {
        onlineUsers.delete(userId);

        User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        }).catch((err) => console.error("Offline status update error:", err.message));

        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      }
    });
  });

  return io;
};

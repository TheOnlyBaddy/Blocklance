import express from "express";
import authMiddleware from "../../middlewares/authMiddleware.js";
import Message from "./message.model.js";
import { io } from "../../server.js";

const router = express.Router();

// Save message
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { roomId, content } = req.body || {};
    if (!roomId || !content) {
      return res.status(400).json({ message: "roomId and content are required" });
    }

    const message = await Message.create({
      sender: req.user._id,
      roomId,
      content,
    });

    io && io.to(roomId).emit("receiveMessage", message);
    return res.status(201).json(message);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Error saving message" });
  }
});

// Fetch messages
router.get("/:roomId", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).populate("sender", "username");
    return res.json(messages);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Error fetching messages" });
  }
});

export default router;

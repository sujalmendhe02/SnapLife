import express from "express";
import mongoose from "mongoose";

import Message from "../models/Message.js";
import { auth} from '../middleware/auth.js';

const router = express.Router();

// Get chat list (conversations)
router.get("/conversations", auth, async (req, res) => {
    try {
        const messages = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: new mongoose.Types.ObjectId(req.userId) },
                        { receiver: new mongoose.Types.ObjectId(req.userId) }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", new mongoose.Types.ObjectId(req.userId)] },
                            "$receiver",
                            "$sender"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            }
        ]);

        res.status(200).json(messages);
    } catch (err) {
        console.error("Error in conversations:", err);
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// Get messages between two users
router.get("/:userId", auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const messages = await Message.find({
            $or: [
                { sender: req.userId, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.userId }
            ]
        })
        .sort({ createdAt: 1 })
        .populate("sender", "username")
        .populate("receiver", "username");

        // Mark messages as read
        await Message.updateMany(
            { 
                sender: req.params.userId, 
                receiver: req.userId, 
                read: false 
            },
            { $set: { read: true } }
        );

        res.status(200).json(messages);
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// Send a message
router.post("/", auth, async (req, res) => {
    console.log("Received message send request");
    try {
        const { receiverId, text } = req.body;

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: "Invalid receiver ID" });
        }

        const newMessage = new Message({
            sender: req.userId,
            receiver: receiverId,
            text
        });

        await newMessage.save();

        console.log("Message saved:", newMessage);

        const populatedMessage = await Message.findById(newMessage._id)
            .populate("sender", "username")
            .populate("receiver", "username");

        // Emit to receiver
        req.app.get("io").to(receiverId).emit("receiveMessage", populatedMessage);

        res.status(201).json(populatedMessage);
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).json({ error: "Server error", message: err.message });
    }
});


// Delete a message
router.delete("/:messageId", auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.messageId)) {
            return res.status(400).json({ message: "Invalid message ID" });
        }

        const message = await Message.findById(req.params.messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (message.sender.toString() !== req.userId) {
            return res.status(403).json({ message: "Unauthorized to delete this message" });
        }

        await message.deleteOne();
        res.status(200).json({ message: "Message deleted successfully" });
    } catch (err) {
        console.error("Error deleting message:", err);
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

router.get('/read/:id', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Fetch all messages between two users
router.get("/:user1/:user2", auth, async (req, res) => {
    try {
        const { user1, user2 } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

export default router;

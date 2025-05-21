import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blogs.js';
import chatRoutes from './routes/chat.js';
import Message from './models/Message.js';

dotenv.config();

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/chats', chatRoutes);

const users = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    users.set(userId, socket.id);
    console.log(`User ${userId} joined`);
  });

  socket.on("sendMessage", async ({ sender, receiver, text }) => {
    try {
      const newMessage = new Message({ sender, receiver, text });
      await newMessage.save();

      if (users.has(receiver)) {
        io.to(users.get(receiver)).emit("receiveMessage", newMessage);
      }
    } catch (error) {
      console.error("Error handling sendMessage event:", error);
    }
  });

  socket.emit('newNotification', { message: 'This is a test notification!' });

  socket.on("disconnect", () => {
    for (let [key, value] of users.entries()) {
      if (value === socket.id) {
        users.delete(key);
        break;
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

app.set("io", io);
export { io };

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

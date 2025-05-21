import { useEffect, useState, useContext, useRef } from "react";
import { io } from "socket.io-client";
import { MessageCircle, X, Search, Trash2, Check, CheckCheck } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import axios from "axios";

const socket = io("http://localhost:5000");

const ChatModel = () => {
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadMessages, setUnreadMessages] = useState(new Set());
  const [error, setError] = useState(null);
  const [pendingMessages] = useState(new Set());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    socket.connect();
    socket.emit("join", user._id);

    fetchConversations();

    const handleNewMessage = (message) => {
      if (pendingMessages.has(message._id)) {
        pendingMessages.delete(message._id);
        return;
      }

      if (
        selectedChat &&
        (selectedChat._id === message.sender || selectedChat._id === message.receiver)
      ) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id);
          return exists ? prev : [...prev, message];
        });

        // Mark as read on server
        axios.put(`http://localhost:5000/api/chats/read/${message._id}`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else if (message.sender !== user._id) {
        setUnreadMessages((prev) => new Set([...prev, message.sender]));
      }

      fetchConversations();
    };

    socket.on("receiveMessage", handleNewMessage);

    return () => {
      socket.off("receiveMessage", handleNewMessage);
      socket.disconnect();
    };
  }, [user, selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) searchUsers();
  }, [isOpen]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/chats/conversations", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setConversations(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to load conversations");
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/chats/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessages(res.data);
      setUnreadMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      setError(null);
    } catch (err) {
      setError("Failed to load messages");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/chats",
        { receiverId: selectedChat._id, text: newMessage },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      pendingMessages.add(res.data._id);

      socket.emit("sendMessage", {
        ...res.data,
        sender: user._id,
        receiver: selectedChat._id,
      });

      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      setError("Failed to send message");
    }
  };

  const deleteMessage = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/chats/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      setError("Failed to delete message");
    }
  };

  const searchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(res.data.filter((u) => u._id !== user._id));
    } catch (err) {
      setError("Failed to load users");
    }
  };

  const startNewChat = (selectedUser) => {
    setSelectedChat(selectedUser);
    fetchMessages(selectedUser._id);
  };

  const getTickIcon = (msg) => {
    if (msg.sender._id !== user._id) return null;
    return msg.read ? (
      <CheckCheck size={14} className="text-blue-500 ml-1" />
    ) : (
      <Check size={14} className="text-gray-500 ml-1" />
    );
  };

  return (
    <div className="fixed top-20 left-20 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        <MessageCircle size={24} />
      </button>

      {isOpen && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white w-full max-w-[90vw] h-full max-h-[90vh] shadow-2xl rounded-lg flex flex-col">
          <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg">
            <h2 className="text-lg font-bold">Messages</h2>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
              {error}
            </div>
          )}

          <div className="flex h-full">
            {/* Users List */}
            <div className="w-1/3 border-r">
              <div className="p-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border rounded-md pr-8"
                  />
                  <Search className="absolute right-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>
              <div className="overflow-y-auto h-[calc(100vh-200px)] pr-1">
                {users
                  .filter((u) =>
                    u.username.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((user) => (
                    <div
                      key={user._id}
                      onClick={() => startNewChat(user)}
                      className={`relative p-3 hover:bg-gray-100 cursor-pointer ${selectedChat?._id === user._id ? "bg-gray-100" : ""
                        }`}
                    >
                      <div className="flex items-center">
                        <div className="relative">
                          <span className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mr-2">
                            {user?.username ? user.username.charAt(0).toUpperCase() : "?"}
                          </span>
                          {unreadMessages.has(user._id) && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="font-medium">{user.username}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Chat Window */}
            <div className="w-2/3 flex flex-col">
              {selectedChat ? (
                <>
                  <div className="p-3 bg-gray-100 border-b">
                    <div className="flex items-center">
                      <span className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mr-2">
                        {selectedChat?.username ? selectedChat.username.charAt(0).toUpperCase() : "?"}
                      </span>
                      <p className="font-medium">{selectedChat.username}</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 pr-1">
                    {messages.map((msg, index) => (
                      <div
                        key={msg._id || index}
                        className={`mb-2 flex ${msg.sender._id === user._id ? "justify-end" : "justify-start"
                          }`}
                      >
                        {msg.sender._id !== user._id && (
                          <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">
                            {msg?.sender?.username ? msg.sender.username.charAt(0).toUpperCase(): "?"}
                          </span>
                        )}
                        <div className="relative group">
                          <div
                            className={`p-3 rounded-lg max-w-[70%] ${msg.sender._id === user._id
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200"
                              }`}
                          >
                            <p>{msg.text}</p>
                            <div className="text-xs opacity-75 flex justify-end items-center mt-1">
                              {new Date(msg.createdAt).toLocaleTimeString()}
                              {getTickIcon(msg)}
                            </div>
                          </div>
                          {msg.sender._id === user._id && (
                            <button
                              onClick={() => deleteMessage(msg._id)}
                              className="absolute -top-2 -right-6 opacity-0 group-hover:opacity-100 transition text-red-500"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 border-t">
                    <div className="flex">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 p-3 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={sendMessage}
                        className="px-6 py-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Select a conversation to start chatting
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatModel;

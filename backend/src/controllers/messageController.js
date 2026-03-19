const Message = require('../models/Message');

const getMessages = async (req, res) => {
  try {
    const { userId } = req.params; // The other user
    const myId = req.user.id;

    // Messages between myId and userId
    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId }
      ]
    }).sort({ createdAt: 1 }).populate('sender receiver', 'name');

    // Mark as read if I am the receiver
    await Message.updateMany(
      { sender: userId, receiver: myId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content) {
      return res.status(400).json({ message: 'receiverId and content are required' });
    }

    const message = await Message.create({
      sender: req.user.id,
      senderName: req.user.name,
      receiver: receiverId,
      content,
      read: false
    });

    res.status(201).json({ message });
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecentConversations = async (req, res) => {
  try {
    const myId = req.user.id;
    // We basically want a list of unique users the current user has messaged with
    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }]
    }).sort({ createdAt: -1 }).populate('sender receiver', 'name');

    const usersMap = new Map();
    messages.forEach(m => {
      const otherId = m.sender.toString() === myId ? m.receiver.toString() : m.sender.toString();
      if (!usersMap.has(otherId)) {
        usersMap.set(otherId, m);
      }
    });

    // Return just the values (most recent message for each conversation)
    res.status(200).json({ conversations: Array.from(usersMap.values()) });
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessages, sendMessage, getRecentConversations };

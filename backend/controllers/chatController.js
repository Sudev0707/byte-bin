// controllers/chatController.js
const { Message, Conversation } = require('../models/Chat.js');
const User = require('../models/User.js');


// Get or create a conversation between two users
const getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, userId], $size: 2 }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, userId],
        unreadCount: {}
      });
    }

    res.json({ success: true, conversation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get message history
const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, before } = req.query;
    
    const query = { roomId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Mark messages as read
    await Message.updateMany(
      { roomId, readBy: { $ne: req.user.id } },
      { $addToSet: { readBy: req.user.id } }
    );

    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's conversations list
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'username email avatar')
    .sort({ updatedAt: -1 });

    // Get last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({ roomId: conv._id.toString() })
          .sort({ createdAt: -1 })
          .limit(1);
        
        const otherParticipant = conv.participants.find(
          p => p._id.toString() !== req.user.id
        );
        
        return {
          ...conv.toObject(),
          lastMessage: lastMessage?.content || '',
          lastMessageTime: lastMessage?.createdAt || conv.updatedAt,
          otherParticipant,
          unreadCount: conv.unreadCount[req.user.id] ?? 0
        };
      })
    );

    res.json({ success: true, conversations: conversationsWithLastMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Save message (used by WebSocket)
const saveMessage = async (messageData) => {
  if (!messageData.senderName) {
    messageData.senderName = 'Unknown';
  }
  const message = await Message.create(messageData);
  
  // Update conversation
  await Conversation.findByIdAndUpdate(messageData.roomId, {
    lastMessage: messageData.content,
    lastMessageTime: messageData.createdAt,
    updatedAt: new Date(),
    $inc: { [`unreadCount.${messageData.senderId}`]: 0 } // Reset sender's unread count
  });
  
  // Increment unread count for recipient
  const conversation = await Conversation.findById(messageData.roomId);
  const recipientId = conversation.participants.find(
    p => p.toString() !== messageData.senderId
  );
  if (recipientId) {
    const recipientIdStr = recipientId.toString();
    const currentUnread = conversation.unreadCount[recipientIdStr] ?? 0;
    conversation.unreadCount[recipientIdStr] = currentUnread + 1;
    await conversation.save();
  }
  
  return message;
};

// HTTP endpoint for saving message (fallback when WS offline)
const saveMessageHttp = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;
    const senderName = req.user.username || 'Unknown';

    if (!content || !roomId) {
      return res.status(400).json({ error: 'Content and roomId required' });
    }

    const messageData = {
      roomId,
      senderId,
      senderName,
      content,
      readBy: [senderId],
      createdAt: new Date()
    };

    const savedMessage = await saveMessage(messageData);

    res.json({ 
      success: true, 
      message: savedMessage 
    });
  } catch (error) {
    console.error('HTTP saveMessage error:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
};

module.exports = {getOrCreateConversation, getMessages, getConversations, saveMessage, saveMessageHttp };



// import mongoose from 'mongoose';
const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
    roomId: { type: String, required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    content: { type: String, required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now, index: true }
})


const ConversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: String },
    lastMessageTime: { type: Date, default: Date.now },
unreadCount: { type: {}, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});


MessageSchema.index({ roomId: 1, createdAt: -1 });


const Message = mongoose.model('Message', MessageSchema);
const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = { Message, Conversation };

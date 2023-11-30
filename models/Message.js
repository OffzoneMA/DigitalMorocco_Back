// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId, // Assuming you have a User model for senders
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  chatRoomID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatRoom",
    required: true,
  },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;

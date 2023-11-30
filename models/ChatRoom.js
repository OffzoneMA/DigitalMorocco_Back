// models/ChatRoom.js
const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema({
  participants: [
    { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" ,
  }
], // Reference to users who are part of the chat room
});

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = ChatRoom;

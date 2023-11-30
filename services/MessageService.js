const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');

// Create a new chat message
const createMessage = async (author, message, chatRoomID) => {
    const newMessage = new Message({
      author,
      message,
      chatRoomID,
    });
    return await newMessage.save();
  };
  
  // Get chat messages for a specific chat room
  const getMessages = async (chatRoomID) => {
    return await Message.find({ chatRoomID }).sort({ timestamp: 1 });
  };
  // Create a new chat room
const createChatRoom = async (participants) => {
  try {
    const newChatRoom = new ChatRoom({
      participants,
    });

    const chat = await getChatRoomByParticipants(participants);
    if (!chat) {
      const savedChatRoom = await newChatRoom.save();
      return savedChatRoom;
    } else {
      return chat;
    }
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error; // Rethrow the error to be handled by the calling function
  }
  };
  
  // Get chat rooms
  const getChatRoomByParticipants = async (participants) => {
    return await ChatRoom.findOne({participants: participants });
  };
  const getChatRooms = async () => {
    return await ChatRoom.find();
  };
module.exports = {
  createMessage,
  getMessages,
  createChatRoom,
  getChatRoomByParticipants,
  getChatRooms
};

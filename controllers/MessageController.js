const MessageService = require('../services/MessageService');



  const createMessage = async (req, res) => {
    try {
      const { author, message, chatRoomID } = req.body;
      const createdMessage = await MessageService.createMessage(author, message, chatRoomID);
      res.status(201).json(createdMessage);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to save message' });
    } 
  };
  
  // Get chat messages for a specific chat room
  const getMessages = async (req, res) => {
    try {
      const chatRoomID = req.params.chatRoomID;
      const messages = await MessageService.getMessages(chatRoomID);
      res.status(200).json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  };
  // Create a new chat room
const createChatRoom = async (req, res) => {
    try {
      const {participants } = req.body;
      const createdChatRoom = await MessageService.createChatRoom(participants);
      res.status(201).json({ roomId: createdChatRoom._id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create chat room' });
    }
  };

  
// Get chat rooms
const getChatRooms = async (req, res) => {
  try {
    const chatRooms = await MessageService.getChatRooms();
    res.status(200).json(chatRooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch chat rooms' });
  }
};


module.exports = {
  createMessage,
  getMessages,
  createChatRoom,
  getChatRooms
};

const express = require("express")
const router = express.Router()
const InvestorController = require("../controllers/InvestorController")
const MessageController = require("../controllers/MessageController")
const AuthController = require("../controllers/AuthController")
const upload = require("../middelware/multer")

router.route('/addMessage').post(AuthController.authenticateToken,MessageController.createMessage);

// Get chat messages for a specific chat room
router.route('/:chatRoomID').get(AuthController.authenticateToken,MessageController.getMessages);

router.route('/createChat').post(AuthController.authenticateToken,MessageController.createChatRoom);

router.route('/chatRooms').get(AuthController.authenticateToken, MessageController.getChatRooms);




module.exports = router
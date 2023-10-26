const InvestorService = require('../services/InvestorService');
const MemberService = require('../services/MemberService');
const UserLogService = require('../services/UserLogService');


const InvestorContactService = require('../services/InvestorContactService');


const getInvestors = async (req, res) => {
    try {
        const result = await InvestorService.getAllInvestors(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const addInvestor = async (req, res) => {
    try {
        const result = await InvestorService.CreateInvestor(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
};



const getContactRequests = async (req, res) => {
    try {
        const result = await InvestorContactService.getAllContactRequest(req.query, "investor", req.investorId)
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong!" });
    }
}

const getContacts = async (req, res) => {
    try {
        const result = await InvestorService.getContacts( req.investorId)
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong!" });
    }
}

const getProjects = async (req, res) => {
    try {
        const result = await InvestorService.getProjects( req.investorId)
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong!" });
    }
}

const updateContactStatus = async (req, res) => {

    try {
        const result = await InvestorService.updateContactStatus(req.investorId,req.params.requestId , req.body.response);
        res.status(200).json(req.body.response);
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
};
async function createChatRoomWithMember(req, res) {
    try {
      const investorId = req.user.id; // Assuming you have the authenticated investor's ID in req.user.id
      const memberId = req.params.memberId;
      
      const conversation = await InvestorService.createChatRoomWithMember(investorId, memberId);
  
      if (conversation) {
        return res.status(200).json(conversation);
      } else {
        return res.status(400).json({ message: 'Failed to create a chat room.' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  async function getChatMessagesInRoom(req, res) {
    try {
      const investorId = req.user.id; // Assuming you have the authenticated investor's ID in req.user.id
      const roomId = req.params.roomId;
  
      const messages = await InvestorService.getChatMessagesInRoom(investorId, roomId);
  
      if (messages) {
        return res.status(200).json(messages);
      } else {
        return res.status(400).json({ message: 'Failed to get chat messages.' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  async function sendChatMessageInRoom(req, res) {
    try {
      const investorId = req.user.id; // Assuming you have the authenticated investor's ID in req.user.id
      const roomId = req.params.roomId;
      const text = req.body.text;
  
      const message = await InvestorService.sendChatMessageInRoom(investorId, roomId, text);
  
      if (message) {
        return res.status(200).json(message);
      } else {
        return res.status(400).json({ message: 'Failed to send chat message.' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  async function getInvestorConversations(req, res) {
    const investorId = req.params.investorId;
  
    try {
      const conversations = await InvestorService.getInvestorConversations(investorId);
      return res.json(conversations);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
module.exports = { updateContactStatus, addInvestor, getInvestors, getContactRequests, getContacts, getProjects, createChatRoomWithMember, getChatMessagesInRoom, sendChatMessageInRoom, getInvestorConversations}
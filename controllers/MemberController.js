const MemberService = require('../services/MemberService');
const InvestorService = require('../services/InvestorService');
const InvestorContactService = require('../services/InvestorContactService');
const UserLogService = require('../services/UserLogService');
const UserService = require('../services/UserService');
const EmailingService = require('../services/EmailingService');




const getMembers = async (req, res) => {
    try {
        const result = await MemberService.getAllMembers(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getContacts = async (req, res) => {
    try {
        const result = await MemberService.getContacts(req.memberId)
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong!"});
    }
}

const createEnterprise = async (req, res) => {
    try {
        let data = isJsonString(req?.body.infos) ? JSON.parse(req?.body.infos) : req?.body.infos
        const result = await MemberService.createEnterprise(req.memberId, data, req?.files?.files, req?.files?.logo);
        const member = await MemberService.getMemberById(req.memberId);
        const log = await UserLogService.createUserLog('Enterprise Edited', member.owner);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message }); 
    }
};

const createProject= async (req, res) => {

        try {
            let data = isJsonString(req?.body.infos) ? JSON.parse(req?.body.infos) : req?.body.infos
            const result = await MemberService.createProject(req.memberId, data, req?.files);
            const member = await MemberService.getMemberById(req.memberId);
            const log = await UserLogService.createUserLog('Project Creation', member.owner);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }


const contactRequest = async (req, res) => {
    try {
        const result = await InvestorContactService.CreateInvestorContactReq(req.memberId,req.params.investorId)
        const member = await MemberService.getMemberById(req.memberId);
        const messageLog ='Request ID :'+result._id+' from member : '+req.memberId+' to investor : '+req.params.investorId;
        const log = await UserLogService.createUserLog(messageLog, member.owner);
        const investor =  await InvestorService.getInvestorById(req.params.investorId);
        const logInvestor = await UserLogService.createUserLog(messageLog, investor.owner);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getContactRequests = async (req, res) => {
    try {
        const result = await InvestorContactService.getAllContactRequest(req.query,"member",req.memberId)
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong!"});
    }
}



const getByName = async (req, res) => {
    try {
        const result = await MemberService.getMemberByName(req.params.name);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message }); 
    }
};

const subUser = async (req, res) => {
    try {
        const result = await MemberService.SubscribeMember(req.memberId, req.params.subid);
        const member = await MemberService.getMemberById(req.memberId);
        const log = await UserLogService.createUserLog('Account Subscribed', member.owner);
        const creditsAdded = member.credits;

        // Create a log for "Credits added" with the number of credits
        const creditsLog = await UserLogService.createUserLog(`Credits added: +${creditsAdded}`, member.owner);

        // Calculate and format the expiry date
        const expiry_date = member.expireDate;
        // Create a log for "Expiry date: ..."
        const expiryDateLog = await UserLogService.createUserLog(`Expiry date: ${expiry_date}`, member.owner);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message }); 
    }
};

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
const createChatRoomWithInvestor = async (req, res) => {
    try {
        
        
        const investorId = req.params.investorId;
             
        const memberId = req.memberId;
        console.log('Creating chat room with Member ID:', memberId, 'and Investor ID:', investorId);


      const conversation = await MemberService.createChatRoomWithInvestor(memberId, investorId);
  
      if (conversation) {
        return res.status(200).json({ conversationId: conversation._id });
      } else {
        return res.status(400).json({ message: 'Failed to create a chat room.' });
      }
    } catch (error) {

console.error('Error creating chat room:', error); // Log the specific error for debugging
    return res.status(500).json({ message: 'Internal server error. Please check your request.' });    }
  }
  
  
  async function getChatMessagesInRoom(req, res) {
    try {
        const member = await MemberService.getMemberById(req.memberId);
      const roomId = req.params.roomId;
  
      const messages = await MemberService.getChatMessagesInRoom(member, roomId);
  
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
      const memberId = req.user.id; // Assuming you have the authenticated member's ID in req.user.id
      const roomId = req.params.roomId;
      const text = req.body.text;
  
      const message = await MemberService.sendChatMessageInRoom(memberId, roomId, text);
  
      if (message) {
        return res.status(200).json(message);
      } else {
        return res.status(400).json({ message: 'Failed to send chat message.' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  async function getMemberConversations(req, res) {
    const memberId = req.params.memberId;
  
    try {
      const conversations = await MemberService.getMemberConversations(memberId);
      return res.json(conversations);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
module.exports = { getContacts,getMembers, createEnterprise, getByName, subUser, createProject, contactRequest, getContactRequests, createChatRoomWithInvestor, getChatMessagesInRoom, sendChatMessageInRoom, getMemberConversations }

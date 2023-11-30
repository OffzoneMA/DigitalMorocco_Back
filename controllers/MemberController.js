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






module.exports = { getContacts,getMembers, createEnterprise, getByName, subUser, createProject, contactRequest, getContactRequests}

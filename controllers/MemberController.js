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

async function createMember(req, res) {
    try {
        const userId = req.params.userId;
        const memberData = req.body;
        const result = await MemberService.CreateMember(userId, memberData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createCompany = async (req, res)=> {
    try {
        const memberId = req.params.memberId;
        const companyData = req.body;
        const logo = req.file;
        //console.log("data" ,companyData);
        //console.log("logo" , logo)
        const result = await MemberService.createCompany(memberId ,companyData , logo);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createEmployee = async (req, res)=> {
    try {
        const memberId = req.params.memberId;
        const employeeData = req.body;
        const photoFile = req.file;
        const result = await MemberService.createEmployee(memberId, employeeData ,photoFile);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateEmployee(req, res) {
    try {
        const { memberId, employeeId } = req.params;
        const updatedEmployeeData = req.body;
        const photo = req.file;
        const updatedEmployee = await MemberService.updateEmployee(memberId, employeeId, updatedEmployeeData, photo);
        res.status(200).json(updatedEmployee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function deleteEmployee(req, res) {
    try {
        const { memberId, employeeId } = req.params;
        const deletedEmployee = await MemberService.deleteEmployee(memberId, employeeId);
        res.status(200).json(deletedEmployee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const createLegalDocument = async (req, res)=> {
    try {
        const memberId = req.params.memberId;
        const documentData = req.body;
        const docFile = req.file;
        const result = await MemberService.createLegalDocument(memberId, documentData , docFile);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateLegalDocument(req, res) {
    try {
        const { memberId, documentId } = req.params;
        const updatedDocumentData = req.body;
        const docFile = req.file;
        const updatedDocument = await MemberService.updateLegalDocument(memberId, documentId, updatedDocumentData, docFile);
        res.status(200).json(updatedDocument);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function deleteLegalDocument(req, res) {
    try {
        const { memberId, documentId } = req.params;
        const deletedDocument = await MemberService.deleteLegalDocument(memberId, documentId);
        res.status(200).json(deletedDocument);
    } catch (error) {
        res.status(400).json({ error: error.message });
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

async function getTestAllMembers(req, res) {
    try {
        const members = await MemberService.getTestAllMembers();
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getInvestorsForMember(req, res) {
    const memberId = req.params.memberId;

    try {
        const investors = await MemberService.getInvestorsForMember(memberId);
        res.json({ success: true, investors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function getContactRequestsForMember(req, res) {
    const memberId = req.params.memberId;

    try {
        const contactRequests = await InvestorContactService.getContactRequestsForMember(memberId);
        res.json({ success: true, contactRequests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}



module.exports = { getContacts,getMembers, createEnterprise, getByName, subUser, createProject, 
    contactRequest, getContactRequests , createCompany , createEmployee , createLegalDocument ,createMember ,
getTestAllMembers , getInvestorsForMember , getContactRequestsForMember ,updateEmployee ,
deleteEmployee ,updateLegalDocument, deleteLegalDocument}

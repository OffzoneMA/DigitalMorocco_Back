const MemberService = require('../services/MemberService');
const InvestorService = require('../services/InvestorService');
const InvestorContactService = require('../services/InvestorContactService');
const UserLogService = require('../services/UserLogService');
//const UserService = require('../services/UserService');
//const EmailingService = require('../services/EmailingService');
const Member = require("../models/Member");
//const User = require("../models/User");
//const ActivityHistoryService = require('../services/ActivityHistoryService');


const getMembers = async (req, res) => {
    try {
        const result = await MemberService.getAllMembers(req.query);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addCompanyToMember = async (req, res) => {
    try {
        const userId = req.params.userId;
       
        const companyData = req.body;
        
        const savedCompany = await MemberService.createCompany(userId, companyData);
        res.status(201).json(savedCompany);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
  };

  async function updateMember(req, res) {
    try {
        const memberId = req.params.id;
        const updateData = req.body;
        const updatedMember = await MemberService.updateMember(memberId, updateData);
        res.status(200).json(updatedMember);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

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

async function CreateMemberWithLogo(req, res) {
    try {
        const userId = req.params.userId;
        const memberData = req.body;
        const logo = req.file;
        const result = await MemberService.CreateMemberWithLogo(userId, memberData , logo);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createCompany = async (req, res)=> {
    try {
        const memberId = req.memberId;
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
            const pitchDeck = req.files['pitchDeck'];
            const businessPlan = req.files['businessPlan'];
            const financialProjection = req.files['financialProjection'];
            const files = req.files['files']; 
            const logo = req.files['logo'];
            // console.log("pitchDeck",pitchDeck)
            // console.log("businessPlan",businessPlan)

            // console.log("financialProjection",financialProjection)

            // console.log("files",files)

            const result = await MemberService.createProject(req.memberId, data, pitchDeck?.[0], businessPlan?.[0] , financialProjection?.[0], files , logo?.[0]);
            const member = await MemberService.getMemberById(req.memberId);
            const log = await UserLogService.createUserLog('Project Creation', member.owner);
            res.status(200).json(result);
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: error.message });
        }
}

const updateProject= async (req, res) => {

    try {
        let data = isJsonString(req?.body.infos) ? JSON.parse(req?.body.infos) : req?.body.infos
        const pitchDeck = req.files['pitchDeck'];
        const businessPlan = req.files['businessPlan'];
        const financialProjection = req.files['financialProjection'];
        const files = req.files['files'];
        const logo = req.files['logo']; 

        // console.log("pitchDeck",pitchDeck)
        // console.log("businessPlan",businessPlan)

        // console.log("financialProjection",financialProjection)

        // console.log("files",files)

        const result = await MemberService.updateProject(req.params.projectId, data, pitchDeck?.[0], businessPlan?.[0] , financialProjection?.[0], files , logo?.[0]);
        const member = await MemberService.getMemberById(result.owner);
        const log = await UserLogService.createUserLog('Project Edition', member.owner);
        res.status(200).json(result);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
}

async function getAllProjectsForMember(req, res) {
    try {
      const memberId = req.memberId;
      const args = req.query;
      const projects = await MemberService.getAllProjectsForMember(memberId, args);
      res.status(200).json(projects);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

async function getAllProjectsForMemberWithoutPagination(req, res) {
try {
    const memberId = req.memberId;
    const args = req.query;
    const projects = await MemberService.getAllProjectsForMemberWithoutPagination(memberId, args);
    res.status(200).json(projects);
} catch (error) {
    res.status(400).json({ message: error.message });
}
}

const contactRequest = async (req, res) => {
    try {
        const { investorId, projectId } = req.body;
        const document = req.file;
        const result = await InvestorContactService.CreateInvestorContactReqForProject(req.memberId,investorId , projectId , document , req.body?.letter)
        const member = await MemberService.getMemberById(req.memberId);
        const messageLog ='Request ID :'+result._id+' from member : '+req.memberId+' to investor : '+ investorId + ' for project : '+projectId;
        const log = await UserLogService.createUserLog(messageLog, member.owner);
        const investor =  await InvestorService.getInvestorById(investorId);
        const logInvestor = await UserLogService.createUserLog(messageLog, investor.owner);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log( "send contact"  ,error)
    }
}

const getContactRequests = async (req, res) => {
    try {
        const result = await MemberService.getContactRequestsForMember(req.memberId , req?.query)
        res.status(200).json(result);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error?.message});
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
    const memberId = req.memberId;

    try {
        const investors = await MemberService.getInvestorsForMember(memberId , req.query);
        res.json({ success: true, investors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getDistinctInvestorFieldValues = async (req, res) => {
    const field = req.params.field;
    const memberId = req.memberId;

    try {
        const distinctValues = await MemberService.getDistinctInvestorsValuesForMember(memberId, field);
        res.status(200).json({ distinctValues });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

async function getContactRequestsForMember(req, res) {
    const memberId = req.memberId;

    try {
        const contactRequests = await InvestorContactService.getContactRequestsForMember(memberId);
        res.json({ success: true, contactRequests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getUniqueCountries = async (req, res) => {
    try {
      const countries = await Member.distinct('country');
      res.status(200).json(countries);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des pays uniques', error });
    }
};

const getUniqueStages = async (req, res) => {
    try {
      const stages = await Member.distinct('stage');
      res.status(200).json(stages);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des stages uniques', error });
    }
};

const getUniqueCompanyTypes = async (req, res) => {
    try {
      const members = await Member.find().select('companyType');
      const companyTypesSet = new Set();
  
      members.forEach(member => {
        if (member.companyType) {
          member.companyType.split(',').forEach(type => {
            companyTypesSet.add(type.trim());
          });
        }
      });
  
      res.status(200).json([...companyTypesSet]);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des types de compagnie uniques', error });
    }
};

const createTestCompany = async (req, res) => {
    try {
        const role = req.body.role;
        const companyData = isJsonString(req?.body.companyData) ? JSON.parse(req?.body.companyData) : req?.body.companyData
        const logo = req.file; 
        const userId = req.userId;
        const result = await MemberService.createTestCompany(userId, role, companyData, logo);

        return res.status(200).json(result);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
};

const shareProject = async (req, res) => {
    try {
        const { projectId,  investorIds } = req.body;
        const memberId = req.memberId;
        const contact = await InvestorContactService.shareProjectWithInvestors(projectId, memberId, investorIds);
        res.status(200).json(contact);
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error.message });
    }
};

const getDistinctRequestFieldValues = async (req, res) => {
    const {field } = req.params;
    const memberId = req.memberId ;
    try {
        const distinctValues = await InvestorContactService.getDistinctFieldValues("member", memberId, field);
        res.status(200).json({ distinctValues });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInvestorsForMemberWithoutPagination = async (req, res) => {

    try {
        const investors = await MemberService.getInvestorsForMemberWithoutPagination(req.memberId);
        res.status(200).json({ investors });
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving investors: ' + error.message });
    }
};

const createDraftContactRequest = async (req, res) => {
    const { investorId } = req.body;
    try {
        const contact = await InvestorContactService.CreateDraftContactRequest(req.memberId, investorId);
        res.status(201).json(contact);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Finalize Contact Request
const finalizeContactRequest = async (req, res) => {
    const { projectId, contactRequestId , letter } = req.body;
    const document = req.file;

    try {
        const contact = await InvestorContactService.FinalizeContactRequest(contactRequestId, projectId, document, letter);
        res.status(200).json(contact);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {  addCompanyToMember,getContacts,getMembers, createEnterprise, getByName, createProject, 
    contactRequest, getContactRequests , createCompany  ,createMember ,getTestAllMembers , 
    getInvestorsForMember , getContactRequestsForMember , getAllProjectsForMember , updateProject , 
     getUniqueCountries , getUniqueStages , getUniqueCompanyTypes , createTestCompany ,
    updateMember , shareProject , CreateMemberWithLogo , getDistinctInvestorFieldValues ,
getDistinctRequestFieldValues , getAllProjectsForMemberWithoutPagination  , getInvestorsForMemberWithoutPagination , 
createDraftContactRequest , finalizeContactRequest 
};

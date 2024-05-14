const MemberService = require('../services/MemberService');
const InvestorService = require('../services/InvestorService');
const InvestorContactService = require('../services/InvestorContactService');
const UserLogService = require('../services/UserLogService');
const UserService = require('../services/UserService');
const EmailingService = require('../services/EmailingService');
const Member = require("../models/Member");
const User = require("../models/User");


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

const addLegalDocumentToMember = async (req, res) => {
const memberId = req.params.userId;
const documentData= req.body; 

try {
    const updatedMember = await MemberService.addLegalDocumentToMember(memberId, documentData);
    res.status(201).json(updatedMember);
} catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
}
};

const getLegalDocuments = async (req, res) => {
    try {
        const members = await Member.find({}).select('legalDocument owner');
        let allLegalDocuments = [];
       
        for (const member of members) {
            const owner = member.owner; 
            const user = await User.findById(owner);    
            const ownerName = user.displayName;
            const ownerId =user._id;
            const legalDocumentsWithOwner = member.legalDocument.map(document => ({
                ...document.toObject(), 
                owner: ownerName ,
                ownerId: ownerId
            }));
            allLegalDocuments = allLegalDocuments.concat(legalDocumentsWithOwner);
            
        }
        

        res.json(allLegalDocuments);
    } catch (error) {
        console.error("Error fetching legal documents:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const deleteLegalDocument = async(req, res) => {
    const documentId = req.params.id;
    console.log(documentId)

    try {
      const deletedDocument = await MemberService.deleteLegalDocument(documentId);
      res.json({ message: "Document deleted successfully", deletedDocument });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
}

const editLegalDocument = async(req, res) => {
  
    const documentId = req.params.id;
    const userId = req.params.userId;
    const updatedDocumentData = req.body;  

    try {
        const updatedEmployee = await MemberService.editLegalDocument(documentId,userId, updatedDocumentData);
        res.status(200).json(updatedEmployee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getEmployees = async (req, res) => {
    try {
      const members = await Member.find({}).select('listEmployee owner');
  
      let allEmployees = [];
     
      // Parcourir chaque membre pour extraire leurs employés
      members.forEach(member => {
        const owner = member.owner; // Récupérer l'ID du propriétaire
        const employeesWithOwner = member.listEmployee.map(employee => ({
          ...employee.toObject(), // Convertir en objet JavaScript
          owner: owner // Ajouter le champ owner à chaque employé
        
        }));
        allEmployees = allEmployees.concat(employeesWithOwner);
      });
  
      // Retourner la liste de tous les employés avec owner
      res.status(200).json(allEmployees);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};
  
const addEmployeeToMember = async (req, res) => {
    try {
      const memberId = req.params.userId;
      const newEmployeeData = req.body;
      const base64Data = newEmployeeData.photo.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
  
      const result = await MemberService.addEmployeeToMember(memberId, {
        ...newEmployeeData,
        photo: buffer, // Stocker les données binaires de l'image
      });
  
      res.status(201).json(result);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'employé :', error);
      res.status(500).json({ message: 'Quelque chose s\'est mal passé' });
    }
};

const updateEmployeeFromMember = async(req, res) => {
    const memberId = req.params.memberId;
    const employeeId = req.params.employeeId;
    const updatedEmployeeData = req.body;    

    try {
        const updatedEmployee = await MemberService.updateEmployeeToMember(memberId, employeeId, updatedEmployeeData);
        res.status(200).json(updatedEmployee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}  
  
const deleteEmployeeFromMember = async(req,res) => {
    const { employeeId } = req.params;
    try {        
        await Member.updateOne({ "listEmployee._id": employeeId }, { $pull: { "listEmployee": { _id: employeeId } } });
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ message: 'Something went wrong' });
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

const createEmployee = async (req, res)=> {
    try {
        const memberId = req.memberId;
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
        const memberId = req.memberId;
        const employeeId = req.params.employeeId;
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
        const memberId = req.memberId;
        const employeeId = req.params.employeeId;
        const deletedEmployee = await MemberService.deleteEmployee(memberId, employeeId);
        res.status(200).json(deletedEmployee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const createLegalDocument = async (req, res)=> {
    try {
        const memberId = req.memberId;
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
        const memberId = req.memberId;
        const documentId = req.params.documentId;
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
        const memberId = req.memberId;
        const documentId = req.params.documentId;
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
            const pitchDeck = req.files['pitchDeck'];
            const businessPlan = req.files['businessPlan'];
            const financialProjection = req.files['financialProjection'];
            const files = req.files['files']; 
            // console.log("pitchDeck",pitchDeck)
            // console.log("businessPlan",businessPlan)

            // console.log("financialProjection",financialProjection)

            // console.log("files",files)

            const result = await MemberService.createProject(req.memberId, data, pitchDeck[0], businessPlan[0] , financialProjection[0], files);
            const member = await MemberService.getMemberById(req.memberId);
            const log = await UserLogService.createUserLog('Project Creation', member.owner);
            res.status(200).json(result);
        } catch (error) {
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

        const result = await MemberService.updateProject(req.params.projectId, data, pitchDeck?.[0], businessPlan?.[0] , financialProjection?.[0], files);
        const member = await MemberService.getMemberById(result.owner);
        const log = await UserLogService.createUserLog('Project Edition', member.owner);
        res.status(200).json(result);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: error.message });
    }
}

async function getAllProjectsForMember(req, res) {
    try {
        const memberId = req.memberId;
        const projects = await MemberService.getAllProjectsForMember(memberId);
        res.status(200).json(projects);
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
    const memberId = req.memberId;

    try {
        const investors = await MemberService.getInvestorsForMember(memberId);
        res.json({ success: true, investors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function getContactRequestsForMember(req, res) {
    const memberId = req.memberId;

    try {
        const contactRequests = await InvestorContactService.getContactRequestsForMember(memberId);
        res.json({ success: true, contactRequests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}



module.exports = { editLegalDocument,deleteLegalDocument, getLegalDocuments, addLegalDocumentToMember, addCompanyToMember,updateEmployeeFromMember,deleteEmployeeFromMember,addEmployeeToMember,getEmployees,getContacts,getMembers, createEnterprise, getByName, subUser, createProject, 
    contactRequest, getContactRequests , createCompany , createEmployee , createLegalDocument ,createMember ,
getTestAllMembers , getInvestorsForMember , getContactRequestsForMember ,updateEmployee ,
deleteEmployee ,updateLegalDocument, deleteLegalDocument , getAllProjectsForMember , updateProject}

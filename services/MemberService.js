const Member = require("../models/Member");
const SubscriptionLogs = require("../models/SubscriptionLogs");
const Subscription = require("../models/Subscription");
const Investor = require("../models/Investor");
const Project = require("../models/Project");
const SubscriptionService = require("../services/SubscriptionService");
const SubscriptionPlanService = require("../services/SubscriptionPlanService");
const SubscriptionLogService = require("../services/SubscriptionLogService");
const uploadService = require('./FileService')
const MemberReq = require("../models/Requests/Member");
const ContactRequest = require("../models/ContactRequest");
const { v4: uuidv4 } = require('uuid');
const ActivityHistoryService = require('../services/ActivityHistoryService');

function generateLegalDocumentId() {
    return "DOC"+uuidv4();
}

function generateEmployeeId() {
    return "EMP"+uuidv4();
}

const getAllMembers = async (args) => {
    try {
        const page = args.page || 1;
        const pageSize = args.pageSize || 15;
        const skip = (page - 1) * pageSize;

        const query = {
            companyName: { $exists: true },
            visbility: 'public',
        };

        if (args.countries && args.countries.length > 0) {
            query.country = { $in: args.countries.split(',') };
        }

        // if (args.sectors && args.sectors.length > 0) {
        //     const sectorsArray = args.sectors.split(',').map(sector => sector.trim());
        //     const regexArray = sectorsArray.map(sector => ({
        //         companyType: new RegExp(`\\b${sector}\\b`, 'i')
        //     }));
        //     query.$or = regexArray;
        // }

        if (args.sectors && args.sectors.length > 0) {
            // const sectorsArray = args.sectors.split(',').map(sector => sector.trim());
            query.companyType = { $in: args.sectors.split(',') };
            // query.companyType = { $regex: sectorsArray.join('|'), $options: 'i' };
        }        
        

        if (args.stages && args.stages.length > 0) {
            query.stage = { $in: args.stages.split(',') };
        }
        const totalCount = await Member.countDocuments(query);
        const totalPages = Math.ceil(totalCount / pageSize);
        const members = await Member.find(query)
            .select('_id companyName website logo desc companyType country')
            .skip(skip)
            .limit(pageSize);

        return { members, totalPages };
    } catch (error) {
        console.error('Error fetching members:', error);
        throw new Error('Something went wrong');
    }
};

async function getTestAllMembers() {
    return await Member.find();
}

async function updateMember(memberId, updateData) {
    try {
        const updatedMember = await Member.findByIdAndUpdate(memberId, updateData, { new: true });
        if (!updatedMember) {
            throw new Error('Member not found');
        }
        return updatedMember;
    } catch (error) {
        throw error;
    }
}

const getAllEmployees = async (args) => {
    try {
        const page = args.page || 1;
        const pageSize = args.pageSize || 10;
        const skip = (page - 1) * pageSize;

        const query = {
            companyName: { $exists: true },
            visbility: 'public',
        };

        if (args.countries && args.countries.length > 0) {
            query.country = { $in: args.countries.split(',') };
        }

        if (args.sectors && args.sectors.length > 0) {
            query.companyType = { $in: args.sectors.split(',') };
        }

        if (args.stages && args.stages.length > 0) {
            query.stage = { $in: args.stages.split(',') };
        }

        const totalCount = await Member.countDocuments(query);
        const totalPages = Math.ceil(totalCount / pageSize);
        const members = await Member.find(query)
            .select('_id companyName website logo desc companyType')
            .skip(skip)
            .limit(pageSize);

        return { members, totalPages };
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw new Error('Something went wrong');
    }
};

const addEmployee = async (userId, newEmployeeData) => {
    try {
        const member = await Member.findOne({ owner: userId });
        if (!member) {
            throw new Error('Membre non trouvé');
        }

        member.listEmployee.push({
            ...newEmployeeData,
        });

        await member.save();

        return {
            employee: newEmployeeData,
        };
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'employé :', error);
        throw new Error('Quelque chose s\'est mal passé');
    }
};

const createCompany = async (userId, companyData) => {
    try {
        const existingMember = await Member.findOne({ owner: userId });
        if (existingMember) {
            existingMember.companyName = companyData.companyName;
            existingMember.legalName = companyData.legalName;
            existingMember.website = companyData.website;
            existingMember.contactEmail = companyData.contactEmail;
            existingMember.desc = companyData.desc;
            existingMember.country = companyData.country;
            existingMember.city = companyData.city.name;
            existingMember.companyType = companyData.companyType;
            existingMember.taxNbr = companyData.taxIdentfier;
            existingMember.corporateNbr = companyData.corporateNbr;
            existingMember.logo = companyData.logo;

            const savedMember = await existingMember.save();

            return {
                message: 'Nouvelle entreprise ajoutée avec succès',
                company: savedMember,
            };
        }
        throw new Error("Le membre n'existe pas pour cet utilisateur");
    } catch (error) {
        throw new Error("Impossible de créer l'entreprise : " + error.message);
    }
};

const createTestCompany = async (userId, companyData , logo) => {
    try {
        const existingMember = await Member.findOne({ owner: userId });
        if (existingMember) {
            existingMember.companyName = companyData.companyName;
            existingMember.legalName = companyData.legalName;
            existingMember.website = companyData.website;
            existingMember.contactEmail = companyData.contactEmail;
            existingMember.desc = companyData.desc;
            existingMember.country = companyData.country;
            existingMember.city = companyData.city;
            existingMember.stage = companyData.stage;
            existingMember.companyType = companyData.companyType;
            existingMember.taxNbr = companyData.taxIdentfier;
            existingMember.corporateNbr = companyData.corporateNbr;

            if (logo) {
                let logoLink = await uploadService.uploadFile(logo, "Members/" + existingMember.owner + "", 'logo')
                existingMember.logo = logoLink
            }

            const savedMember = await existingMember.save();

            return {
                message: 'Nouvelle entreprise ajoutée avec succès',
                company: savedMember,
            };
        }
        throw new Error("Le membre n'existe pas pour cet utilisateur");
    } catch (error) {
        throw new Error("Impossible de créer l'entreprise : " + error.message);
    }
};

const addLegalDocumentToMember = async (memberId, documentData) => {
    try {
      const member = await Member.findOne({ owner: memberId });
      if (!member) {
        throw new Error("Member not found");
      }
       
      const newDocument = {
        name: documentData.name,
        date: Date.now(),
        type: documentData.type,
        lastModifiedDate: documentData.lastModifiedDate,
        title: documentData.title,
        data:documentData.data,
      };
      member.legalDocument.push(newDocument);
      await member.save();
      return member;
    } catch (error) {
      throw error;
    }
};

const deleteLegalDocument = async (documentId) => {
    try {
        const deletedDocument = await Member.findOneAndUpdate(
          { 'legalDocument._id': documentId },
          { $pull: { legalDocument: { _id: documentId } } },
          { new: true }
        );
    
        if (!deletedDocument) {
          throw new Error("Document not found");
        }
    
        return deletedDocument;
      } catch (error) {
        console.error("Error deleting document:", error);
        throw error;
      }
};

const editLegalDocument = async (documentId,userId, updatedDocumentData) => {
    try {
       
        const member = await Member.findOne({ owner: userId });
        if (!member) {
            throw new Error("Membre non trouvé");
        }

        const documentIndex = member.legalDocument.find(doc => doc._id.toString() === documentId);
        console.log(documentIndex)
       

        if (documentIndex === -1) {
            throw new Error("document legal non trouvé dans ce membre");
        }

        documentIndex.title = updatedDocumentData.title;
        documentIndex.data = updatedDocumentData.data;
        documentIndex.name = updatedDocumentData.name;
        documentIndex.lastModifiedDate = new Date();
        documentIndex.type = updatedDocumentData.type;

        await member.save();
        
    } catch (error) {
        console.error("Erreur lors de la mise à jour du document :", error);
        throw new Error("Erreur lors de la mise à jour du document ");
    }
}

const updateEmployeeToMember = async (memberId, employeeId, updatedEmployeeData) => {
    try {
        const member = await Member.findOne({ owner: memberId });
        if (!member) {
            throw new Error("Membre non trouvé");
        }

        const employeeIndex = member.listEmployee.findIndex(emp => emp._id.toString() === employeeId);
        if (employeeIndex === -1) {
            throw new Error("Employé non trouvé dans ce membre");
        }

        const employee = member.listEmployee[employeeIndex];

        // Mise à jour des champs uniquement si présents dans updatedEmployeeData
        if (updatedEmployeeData.fullName) employee.fullName = updatedEmployeeData.fullName;
        if (updatedEmployeeData.email) employee.email = updatedEmployeeData.email;
        if (updatedEmployeeData.jobTitle) employee.jobTitle = updatedEmployeeData.jobTitle;
        if (updatedEmployeeData.level) employee.level = updatedEmployeeData.level;
        if (updatedEmployeeData.status) employee.status = updatedEmployeeData.status;
        if (updatedEmployeeData.address) employee.address = updatedEmployeeData.address;
        if (updatedEmployeeData.country) employee.country = updatedEmployeeData.country;
        if (updatedEmployeeData.cityState) employee.cityState = updatedEmployeeData.cityState;
        if (updatedEmployeeData.phoneNumber) employee.phoneNumber = updatedEmployeeData.phoneNumber;
        if (updatedEmployeeData.startDate) employee.startDate = updatedEmployeeData.startDate;
        if (updatedEmployeeData.personalTaxIdentifierNumber) employee.personalTaxIdentifierNumber = updatedEmployeeData.personalTaxIdentifierNumber;
        
        // Gestion de la photo
        if (updatedEmployeeData.photo) {
            const base64Data = updatedEmployeeData.photo.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            employee.photo = buffer;
        }

        if (updatedEmployeeData.department) employee.department = updatedEmployeeData.department;

        await member.save();
        return employee;
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'employé :", error);
        throw new Error("Erreur lors de la mise à jour de l'employé");
    }
}

const CreateMember = async (userId, member) => {
    return await Member.create({ ...member, owner: userId });
};

const createEnterprise = async (memberId, infos, documents, logo) => {
    try {
        let legalDocs = []
        const member = await getMemberById(memberId)
        let entreprise = {
            companyName: infos.companyName,
            legalName: infos.legalName,
            website: infos.website,
            contactEmail: infos.contactEmail,
            address: infos.address,
            desc: infos.desc,
            country: infos.country,
            city: infos.city,
            state: infos?.state,
            companyType: infos.companyType,
            stage: infos.stage,
            taxNbr: infos.tin,
            corporateNbr: infos.cin,
            listEmployee: infos.listEmployees,
            visbility: infos.visbility,
        }


        if (documents) {
            for (const doc of documents) {
                let fileLink = await uploadService.uploadFile(doc, "Members/" + member.owner + "/documents", doc.originalname)
                legalDocs.push({ name: doc.originalname, link: fileLink, type: doc.mimetype })
            }
            entreprise.legalDocument = legalDocs
        }
        if (logo) {
            let logoLink = await uploadService.uploadFile(logo[0], "Members/" + member.owner + "", 'logo')
            entreprise.logo = logoLink
        }
        return await Member.findByIdAndUpdate(memberId, entreprise);
    }
    catch (err) {
        throw new Error('Something went wrong !')
    }
}

// const createCompany = async (memberId, companyData, logoFile) => {
//     try {
//         const member = await getMemberById(memberId);

//         let updatedCompanyData = { ...companyData };

//         if (logoFile) {
//             const logoURL = await uploadService.uploadFile(logoFile, 'Members/' + member.owner + "", 'logo');
//             updatedCompanyData.logo = logoURL;
//             console.log(logoURL)
//         }

//         const updatedMember = await Member.findByIdAndUpdate(memberId, updatedCompanyData);

//         return updatedMember;
//     } catch (error) {
//         console.log(error);
//         throw new Error('Error creating company', error);
//     }
// };

const createEmployee = async (memberId, employeeData , photo)=> {
    try {
        const member = await getMemberById(memberId)
        if (!member) {
            throw new Error('Member not found');
        }
        if (photo) {
            const logoURL = await uploadService.uploadFile(photo, 'Members/' + member.owner + "/employees/" +generateEmployeeId(), photo.originalname);
            employeeData.image = logoURL;
        }
        member.listEmployee.push(employeeData);
        const savedEmployee = await member.save();
        return savedEmployee.listEmployee[savedEmployee.listEmployee.length - 1];
    } catch (error) {
        console.log(error);
        throw new Error('Error creating employee' , error);
    }
}

async function updateEmployee(memberId, employeeId, updatedEmployeeData, photo) {
    try {
        const member = await getMemberById(memberId);
        if (!member) {
            throw new Error('Member not found');
        }
        
        const employeeIndex = member.listEmployee.findIndex(emp => emp._id == employeeId);

        if (employeeIndex === -1) {
            throw new Error('Employee not found');
        }
        
        const filteredEmployeeData = Object.keys(updatedEmployeeData)
        .filter(key => updatedEmployeeData[key] !== '' && updatedEmployeeData[key] !== null && updatedEmployeeData[key] !== undefined)
        .reduce((obj, key) => {
            obj[key] = updatedEmployeeData[key];
            return obj;
        }, {});    

        // filteredEmployeeData.image = member.listEmployee[employeeIndex].image;

        const isEmptyObject = Object.keys(filteredEmployeeData).length === 0;

        if (!isEmptyObject) {
            member.listEmployee[employeeIndex] = { ...member.listEmployee[employeeIndex], ...filteredEmployeeData };
        }

        
        // member.listEmployee[employeeIndex] = { ...member.listEmployee[employeeIndex], ...filteredEmployeeData };

        if (photo && photo !== '') {
            const photoURL = await uploadService.uploadFile(photo, 'Members/' + member.owner + "/employees/" +generateEmployeeId(), photo.originalname);
            member.listEmployee[employeeIndex].image = photoURL;
        }

        const savedMember = await member.save();
        return savedMember.listEmployee[employeeIndex];
    } catch (error) {
        throw new Error('Error updating employee: ' + error.message);
    }
}


async function deleteEmployee(memberId, employeeId) {
    try {
        const member = await getMemberById(memberId);
        if (!member) {
            throw new Error('Member not found');
        }

        const employeeIndex = member.listEmployee.findIndex(emp => emp._id === employeeId);
        if (employeeIndex === -1) {
            throw new Error('Employee not found');
        }

        const deletedEmployee = member.listEmployee.splice(employeeIndex, 1);
        await member.save();
        return deletedEmployee;
    } catch (error) {
        throw new Error('Error deleting employee: ' + error.message);
    }
}

const createLegalDocument = async (memberId, documentData , docFile)=> {
    try {
        const member = await getMemberById(memberId)
        if (!member) {
            throw new Error('Member not found');
        }
        if (docFile) {
            const docURL = await uploadService.uploadFile(docFile, 'Members/' + member.owner + "/documents/"+generateLegalDocumentId(), docFile.originalname);
            documentData.link = docURL;
            documentData.type = docFile.mimetype;
            documentData.name = docFile.originalname;
        }
        member.legalDocument.push(documentData);
        const savedDocument = await member.save();

        // Récupération de l'ID du dernier document ajouté
        const documentId = savedDocument.legalDocument[savedDocument.legalDocument.length - 1]._id;

        // Enregistrement de l'action dans l'historique
        const historyData = {
            eventType: 'legal_document_uploaded',
            timestamp: new Date(),
            user: member.owner,
            actionTargetType: 'Legal document',
            actionTarget: documentId,
        };

        await ActivityHistoryService.createActivityHistory(historyData);

        return savedDocument.legalDocument[savedDocument.legalDocument.length - 1];
    } catch (error) {
        throw new Error('Error creating legal document');
    }
}

async function updateLegalDocument(memberId, documentId, updatedDocumentData, docFile) {
    try {
        const member = await getMemberById(memberId);
        if (!member) {
            throw new Error('Member not found');
        }

        const documentIndex = member.legalDocument.findIndex(doc => doc._id === documentId);
        if (documentIndex === -1) {
            throw new Error('Document not found');
        }

        if (docFile) {
            const docURL = await uploadService.uploadFile(docFile, `Members/${member._id}/documents/${generateLegalDocumentId()}`, docFile.originalname);
            updatedDocumentData.link = docURL;
            updatedDocumentData.type = docFile.mimetype;
            updatedDocumentData.name = docFile.originalname;
        }

        member.legalDocument[documentIndex] = { ...member.legalDocument[documentIndex], ...updatedDocumentData };
        await member.save();
        return member.legalDocument[documentIndex];
    } catch (error) {
        throw new Error('Error updating legal document: ' + error.message);
    }
}

// async function deleteLegalDocument(memberId, documentId) {
//     try {
//         const member = await getMemberById(memberId);
//         if (!member) {
//             throw new Error('Member not found');
//         }

//         const documentIndex = member.legalDocument.findIndex(doc => doc.documentId === documentId);
//         if (documentIndex === -1) {
//             throw new Error('Document not found');
//         }

//         const deletedDocument = member.legalDocument.splice(documentIndex, 1);
//         await member.save();
//         return deletedDocument;
//     } catch (error) {
//         throw new Error('Error deleting legal document: ' + error.message);
//     }
// }

const createTestProject = async (memberId, infos, documents) => {
    const member = await Member.findById(memberId);
    if (!member) {
        throw new Error('Member doesn\'t exist!');
    }

    // Check if the project already exists
    let project = await Project.findOne({ owner: memberId });

    if (!project) {
        // If project doesn't exist, create a new one
        project = new Project({
            owner: memberId,
            name: infos.name,
            funding: infos.fundingAmount,
            currency: infos.currency,
            details: infos.details,
            milestoneProgress: infos.milestoneProgress,
            listMember: infos.listMembers,
            visbility: infos.visbility,
        });

        // Save the project
        await project.save();
    } else {
        // If project exists, update its fields
        project.name = infos.name;
        project.funding = infos.fundingAmount;
        project.currency = infos.currency;
        project.details = infos.details;
        project.milestoneProgress = infos.milestoneProgress;
        project.listMember = infos.listMembers;
        project.visbility = infos.visbility;

        // Check if there are documents to update
        if (documents?.files) {
            let Docs = [];
            for (const doc of documents.files) {
                let fileLink = await uploadService.uploadFile(doc, "Members/" + member.owner + "/Project_documents", doc.originalname);
                Docs.push({ name: doc.originalname, link: fileLink, type: doc.mimetype });
            }
            project.documents = Docs;
        }

        // Save the updated project
        await project.save();
    }

    return project;
};

async function createProject(ownerId, projectData , pitchDeck, businessPlan , financialProjection, documentsFiles) {
    try {

      const member = await Member.findById(ownerId);
      if (!member) {
        throw new Error("Member not found");
    }
      const project = new Project({ owner: ownerId, ...projectData });

    let Docs = [];

    if (documentsFiles) {
        for (const doc of documentsFiles) {
            let fileLink = await uploadService.uploadFile(doc, "Members/" + member.owner + "/Project_documents", doc.originalname);
            Docs.push({ name: doc.originalname, link: fileLink, type: doc.mimetype  , documentType:"other"});
        }
    }
    if (pitchDeck) {
        let pitchDeckLink = await uploadService.uploadFile(pitchDeck, "Members/" + member.owner + "/Project_documents", pitchDeck.originalname);
        Docs.push({ name: pitchDeck.originalname, link: pitchDeckLink, type: pitchDeck.mimetype , documentType:"pitchDeck" });
    }

    if (businessPlan) {
        let businessPlanLink = await uploadService.uploadFile(businessPlan, "Members/" + member.owner + "/Project_documents", businessPlan.originalname);
        Docs.push({ name: businessPlan.originalname, link: businessPlanLink, type: businessPlan.mimetype , documentType:"businessPlan" });
    }

    if (financialProjection) {
        let financialProjectionLink = await uploadService.uploadFile(financialProjection, "Members/" + member.owner + "/Project_documents", financialProjection.originalname);
        Docs.push({ name: financialProjection.originalname, link: financialProjectionLink, type: financialProjection.mimetype , documentType:"financialProjection"});
    }

    project.documents = Docs;

      const savedProject = await project.save();

      // Enregistrement de l'action dans l'historique
      const historyData = {
        eventType: 'project_created',
        eventDetails: 'Created Project',
        timestamp: new Date(),
        user: member.owner,
        finalDetails: 'and save as Draft',
        actionTarget: savedProject._id,
    };

    await ActivityHistoryService.createActivityHistory(historyData);
      return savedProject;
    } catch (error) {
      throw error;
    }
}

async function updateProject(projectId, newData, pitchDeck, businessPlan, financialProjection , documentsFiles) {
    try {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error("Project not found");
        }
        
        project.name = newData.name || project.name;
        project.funding = newData.funding || project.funding;
        project.totalRaised = newData.totalRaised || project.totalRaised;
        project.currency = newData.currency || project.currency;
        project.details = newData.details || project.details;
        project.stage = newData.stage || project.stage;
        project.visbility = newData.visbility|| project.visbility;
        project.country = newData.country|| project.country;
        project.sector = newData.sector|| project.sector;
        console.log(newData.stage)
        if (newData.milestones) {
            const existingMilestoneNames = project.milestones.map(milestone => milestone.name);
            newData.milestones.forEach(newMilestone => {
              if (!existingMilestoneNames.includes(newMilestone.name)) {
                project.milestones.push(newMilestone);
              }
            });
        }
        // if (newData.stages) {
        //     for (const stage of newData.stages) {
        //         const isStageExists = project.stages.includes(stage);
                
        //         if (!isStageExists) {
        //             project.stages.push(stage);
        //         }
        //     }
        // }
        console.log(newData.listMember)
        if (newData.listMember) {
            // Create a map of new members by personalEmail and workEmail
            const newMembersMap = new Map(newData.listMember.map(member => [member.personalEmail + member.workEmail, member]));
            // Filter out members that are no longer in the new list
            project.listMember = project.listMember.filter(existingMember => {
                const key = existingMember.personalEmail + existingMember.workEmail;
                return newMembersMap.has(key);
            });

            // Add or update members
            newData.listMember.forEach(newMember => {
            const key = newMember.personalEmail + newMember.workEmail;
            const existingMemberIndex = project.listMember.findIndex(existingMember => (existingMember.personalEmail + existingMember.workEmail) === key);

            if (existingMemberIndex !== -1) {
                // Update existing member
                project.listMember[existingMemberIndex] = { ...project.listMember[existingMemberIndex], ...newMember };
            } else {
                // Add new member
                project.listMember.push(newMember);
            }
            });
           
          }
        


        if (pitchDeck) {
            const pitchDeckLink = await uploadService.uploadFile(pitchDeck, "Members/" + project.owner + "/Project_documents", pitchDeck.originalname);
            const existingPitchDeckIndex = project.documents.findIndex(doc => doc.documentType === "pitchDeck");
            if (existingPitchDeckIndex !== -1) {
                project.documents[existingPitchDeckIndex].link = pitchDeckLink;
                project.documents[existingPitchDeckIndex].name = pitchDeck.originalname;
                project.documents[existingPitchDeckIndex].type = pitchDeck.mimetype;
            } else {
                project.documents.push({ name: pitchDeck.originalname, link: pitchDeckLink, type: pitchDeck.mimetype, documentType: "pitchDeck" });
            }
        }

        if (businessPlan) {
            const businessPlanLink = await uploadService.uploadFile(businessPlan, "Members/" + project.owner + "/Project_documents", businessPlan.originalname);
            const existingBusinessPlanIndex = project.documents.findIndex(doc => doc.documentType === "pitchDeck");
            if (existingBusinessPlanIndex !== -1) {
                project.documents[existingBusinessPlanIndex].link = businessPlanLink;
                project.documents[existingBusinessPlanIndex].name = businessPlan.originalname;
                project.documents[existingBusinessPlanIndex].type = businessPlan.mimetype;
            } else {
                project.documents.push({ name: businessPlan.originalname, link: businessPlanLink, type: businessPlan.mimetype, documentType: "businessPlan" });
            }        
        }

        if (financialProjection) {
            const financialProjectionLink = await uploadService.uploadFile(financialProjection, "Members/" + project.owner + "/Project_documents", financialProjection.originalname);
            const existingFinancialProjectionIndex = project.documents.findIndex(doc => doc.documentType === "pitchDeck");
            if (existingPitchDeckIndex !== -1) {
                project.documents[existingFinancialProjectionIndex].link = financialProjectionLink;
                project.documents[existingFinancialProjectionIndex].name = financialProjection.originalname;
                project.documents[existingFinancialProjectionIndex].type = financialProjection.mimetype;
            } else {
                project.documents.push({ name: financialProjection.originalname, link: financialProjectionLink, type: financialProjection.mimetype, documentType: "financialProjection" });
            }        
        }

        if (documentsFiles) {
            for (const doc of documentsFiles) {
              const isFileExists = project.documents.some(document => document.name === doc.originalname);
              
              if (!isFileExists) {
                const fileLink = await uploadService.uploadFile(doc, "Members/" + project.owner + "/Project_documents", doc.originalname);
                project.documents.push({ name: doc.originalname, link: fileLink, type: doc.mimetype, documentType: "other" });
              } 
            }
          }
          

        const updatedProject = await project.save();
        return updatedProject;
    } catch (error) {
        console.log(error)
        throw new Error('Error updating project');
    }
}

async function getAllProjectsForMember(memberId, args) {
    try {
        const filter = { owner: memberId };

        if (args.visibility) {
            filter.visbility = args.visibility;
        }

        if (args.status) {
            filter.status = args.status;
        }

        if (args.date) {
            const date = new Date(args.date);
            filter.dateCreated = { $gte: date };
        }

        const projects = await Project.find(filter);
        return projects;
    } catch (error) {
        throw new Error('Error fetching projects for member');
    }
}


const deleteMember = async (userId) => {
    const member = await getMemberByUserId(userId)
    if (member) {
        //Contacts
        await ContactRequest.deleteMany({ member: member._id })
        await Investor.updateMany(
            { $pull: { membersRequestsAccepted: member._id }, $pull: { membersRequestsPending: member._id } })

        //Subscriptions
        await SubscriptionLogs.deleteMany({ member: member._id })

        //Project
        await Project.deleteMany({ owner: member._id })

        await Member.findByIdAndDelete(member._id)
    }
    else {
        await MemberReq.findOneAndDelete({ user: userId })
    }
    await uploadService.deleteFolder('Members/' + userId + "/documents")
    await uploadService.deleteFolder('Members/' + userId + "/Project_documents")
    await uploadService.deleteFolder('Members/' + userId)

}

const getMemberById = async (id) => {
    return await Member.findById(id);
}
const getMemberByUserId = async (userId) => {
    return await Member.findOne({ owner: userId });
}

const getMemberByName = async (name) => {
    return await Member.find({ name: name })
}

const memberByNameExists = async (name) => {
    return await Member.exists({ name: name })
}

// const SubscribeMember = async (memberId, subid) => {
//     const subscription = await SubscriptionService.getSubscriptionById(subid)
//     if (!subscription) {
//         throw new Error('Subscription doesn t exist !')
//     }


//     //Payement Logic ...(Stripe ...)


//     const member = await getMemberById(memberId)
//     if (member?.subStatus == "active") {
//         return await RenewSubscription(member, subscription)
//     }
//     else {
//         //Expire Date calculation
//         const expiry_date = new Date();
//         expiry_date.setDate(expiry_date.getDate() + subscription?.duration);

//         await SubscriptionLogService.createSubscriptionLog({
//             subscriptionId: subscription._id,
//             member: memberId,
//             credits: subscription.credits,
//             totalCredits: subscription.credits + (member?.credits || 0),
//             subscriptionExpireDate: expiry_date
//         })
//         return await Member.findByIdAndUpdate(memberId, {
//             subscriptionId: subscription._id,
//             subStatus: "active",
//             expireDate: expiry_date,
//             $inc: { 'credits': subscription.credits }
//         })
//     }

// }

const SubscribeMember = async (memberId, planId) => {
    try {
        const subscriptionPlan = await SubscriptionPlanService.getSubscriptionPlanById(planId);
        if (!subscriptionPlan) {
            throw new Error('Subscription plan not found!');
        }

        const newSubscription = new Subscription({
            plan: planId,
            billing: 'month', 
            dateCreated: new Date(),
            subscriptionStatus: 'active', 
            dateExpired: null, 
        });
        if (subscriptionPlan.duration) {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + subscriptionPlan.duration);
            newSubscription.dateExpired = expiryDate;
        }

        const savedSubscription = await newSubscription.save();

        const updatedMember = await Member.findByIdAndUpdate(memberId, {
            subscriptionId: savedSubscription._id,
            subStatus: 'active', 
            expireDate: savedSubscription.dateExpires, 
            $inc: { 'credits': subscriptionPlan.credits }, 
        });

        await SubscriptionLogService.createSubscriptionLog({
            subscriptionId: savedSubscription._id,
            member: memberId,
            credits: subscriptionPlan.credits,
            totalCredits: updatedMember.credits,
            subscriptionExpireDate: savedSubscription.dateExpired,
        });

        const historyData = {
            eventType: 'Subscribe_to_plan',
            eventDetails: 'Subscribe to ',
            timestamp: new Date(),
            user: updatedMember.owner,
            actionTargetType: 'Subscribe',
            actionTarget: subscriptionPlan._id,
        };

        await ActivityHistoryService.createActivityHistory(historyData);

        return updatedMember;
    } catch (error) {
        throw new Error('Error subscribing member: ' + error.message);
    }
}

async function cancelSubscriptionForMember(memberId) {
    try {
        const member = await Member.findById(memberId);
        if (!member) {
            throw new Error('Member not found');
        }

        if (!member.subscriptionId) {
            throw new Error('Member does not have an active subscription');
        }

        const subscription = await Subscription.findById(member.subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        const updatedSubscription = await SubscriptionService.cancelSubscription(subscription._id);

        await SubscriptionLogService.createSubscriptionLog({
            subscriptionId: updatedSubscription._id,
            member: member?._id,
            credits: updatedSubscription.plan.credits,
            totalCredits: updatedSubscription.plan.credits + (member?.credits || 0),
            subscriptionExpireDate: updatedSubscription.dateExpired,
            type: 'Cancel'
        })

        const updatedMember = await Member.findByIdAndUpdate(
            memberId, 
            { subStatus: 'notActive' ,
            $inc: { 'credits': -subscription.credits }
        });

        return { member: updatedMember, subscription: updatedSubscription };
    } catch (error) {
        throw new Error('Error cancelling subscription for member: ' + error.message);
    }
}

async function upgradePlan(memberId, newPlanId) {
    try {
        const member = await Member.findById(memberId);
        if (!member) {
            throw new Error('Member not found');
        }

        const newPlan = await SubscriptionPlanService.getSubscriptionPlanById(newPlanId);
        if (!newPlan) {
            throw new Error('New subscription plan not found');
        }

        if (!member.subscriptionId) {
            throw new Error('Member does not have an active subscription');
        }

        const currentSubscription = await Subscription.findById(member.subscriptionId);
        if (!currentSubscription) {
            throw new Error('Current subscription not found');
        }

        const newExpirationDate = new Date();
        newExpirationDate.setDate(newExpirationDate.getDate() + newPlan.duration);

        const updatedSubscription = await Subscription.findByIdAndUpdate(currentSubscription._id, {
            plan: newPlanId,
            dateExpired: newExpirationDate,
            subscriptionStatus: 'active',

        });

        await SubscriptionLogService.createSubscriptionLog({
            subscriptionId: updatedSubscription._id,
            member: member?._id,
            credits: updatedSubscription.credits,
            totalCredits: updatedSubscription.credits + (member?.credits || 0),
            subscriptionExpireDate: newExpirationDate,
            type: 'Upgrade'
        })

        const creditsDifference = newPlan.credits - currentSubscription.plan.credits;
        if (creditsDifference > 0) {
            await Member.findByIdAndUpdate(
                memberId, 
                { $inc: { 'credits': creditsDifference } ,
                subStatus: 'Active',
                expireDate: newExpirationDate
            });
        }

        return updatedSubscription;
    } catch (error) {
        throw new Error('Error upgrading plan: ' + error.message);
    }
}

// const RenewSubscription = async (member, subscription) => {

//     //Expire Date calculation
//     const expiry_date = new Date(member.expireDate);
//     expiry_date.setDate(expiry_date.getDate() + subscription?.duration);

//     await SubscriptionLogService.createSubscriptionLog({
//         subscriptionId: subscription._id,
//         member: member?._id,
//         credits: subscription.credits,
//         totalCredits: subscription.credits + (member?.credits || 0),
//         subscriptionExpireDate: expiry_date,
//         type: 'Renew'
//     })

//     return await Member.findByIdAndUpdate(member?._id, {
//         subscriptionId: subscription._id,
//         subStatus: "active",
//         expireDate: expiry_date,
//         $inc: { 'credits': subscription.credits }
//     })
// }

async function renewSubscription(memberId) {
    try {
        const member = await Member.findById(memberId);
        if (!member) {
            throw new Error('Member not found');
        }

        if (!member.subscriptionId) {
            throw new Error('Member does not have an active subscription');
        }

        const subscription = await Subscription.findById(member.subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        const plan = await SubscriptionPlan.findById(subscription.plan);
        if (!plan) {
            throw new Error('Subscription plan not found');
        }

        const newExpirationDate = new Date();
        newExpirationDate.setDate(newExpirationDate.getDate() + plan.duration);

        const updatedSubscription = await Subscription.findByIdAndUpdate(subscription._id, {
            dateExpires: newExpirationDate,
            subscriptionStatus: 'active', 
            dateStopped: undefined, 
        });

        const updatedMember = await Member.findByIdAndUpdate(memberId, {
            subStatus: 'active', 
            expireDate: newExpirationDate, 
            $inc: { 'credits': updatedSubscription.plan.credits }
        });

        await SubscriptionLogService.createSubscriptionLog({
            subscriptionId: subscription._id,
            member: member?._id,
            credits: subscription.plan.credits,
            totalCredits: subscription.plan.credits + (member?.credits || 0),
            subscriptionExpireDate: newExpirationDate,
            type: 'Renew'
        })

        return { updatedMember, updatedSubscription };
    } catch (error) {
        throw new Error('Error renewing subscription: ' + error.message);
    }
}

const checkSubscriptionStatus = async () => {
    try {
        const current_date = new Date();

        const activeSubscribers = await Member.find({ subStatus: 'active' });

        for (const Member of activeSubscribers) {
            if (Member.expireDate < current_date) {
                await Member.findByIdAndUpdate(Member._id, {
                    subscriptionId: null,
                    expireDate: null,
                    subStatus: 'notActive'

                });
            }
        }
    } catch (err) {
        console.error('Error checking subscription status:', err);
    }
};

const checkMemberSubscription = async (memberId) => {
    try {
        const current_date = new Date();

        const member = await Member.findById(memberId);

        if (member && member?.expireDate < current_date) {
            await Member.findByIdAndUpdate(memberId, {
                subscriptionId: null,
                expireDate: null,
                subStatus: 'notActive'

            });
        }

    } catch (err) {
        console.error('Error checking subscription status:');
    }
};

const getInvestorsForMember = async (memberId) => {
    try {
        const member = await Member.findById(memberId);

        if (!member) {
            throw new Error('Member not found');
        }

        const investorIdsSet = new Set(member.investorsRequestsAccepted);

        const uniqueInvestorIds = Array.from(investorIdsSet);

        const investors = await Investor.find({ _id: { $in: uniqueInvestorIds } });

        return investors;
    } catch (error) {
        throw new Error('Error retrieving investors for member: ' + error.message);
    }
}


const getContacts = async (memberId) => {
    const investors = await Member.findById(memberId).select("investorsRequestsAccepted").populate({
        path: 'investorsRequestsAccepted', select: '_id  name linkedin_link'
    });
    return investors.investorsRequestsAccepted
}

async function addAssociatedUserToMember(memberId, userId) {
    try {
        const member = await Member.findById(memberId);
        if (!member) {
            throw new Error('Member not found');
        }
        member.associatedUsers.push(userId);
        await member.save();
        return member;
    } catch (error) {
        throw new Error('Error adding associated user to member: ' + error.message);
    }
}

async function removeAssociatedUserFromMember(memberId, userId) {
    try {
        const member = await Member.findById(memberId);
        if (!member) {
            throw new Error('Member not found');
        }
        member.associatedUsers.pull(userId);
        await member.save();
        return member;
    } catch (error) {
        throw new Error('Error removing associated user from member: ' + error.message);
    }
}


const checkMemberStatus = async (memberId) => {
    try{
        const member = await Member.findOne({ owner: memberId, subStatus: 'active' });
        if (!member) {
        return false;
        }
        // const subscriptionLog = await SubscriptionLogs.findOne({ member: member._id });
        // if (!subscriptionLog) {
        //     return false;
        // }
        // const currentDate = new Date();
        // const expirationDate = new Date(subscriptionLog.subscriptionExpireDate); 
        // console.log("currentDate",currentDate)
        // console.log("expirationDate",expirationDate)
        // if (currentDate > expirationDate) {
        // return false;
        // }

        return true;
    } catch (error) {
    console.error('Error checking member status:', error);
    return false;
    }

  };

  module.exports = {checkMemberStatus,editLegalDocument,deleteLegalDocument, addLegalDocumentToMember, createCompany, updateEmployeeToMember, addEmployee, getAllEmployees, deleteMember, getContacts, getAllMembers, createProject, checkSubscriptionStatus, 
    CreateMember, createEnterprise, getMemberById, memberByNameExists, getMemberByName, 
    SubscribeMember, getMemberByUserId, checkMemberSubscription, checkSubscriptionStatus ,
    createCompany , createEmployee, createLegalDocument , getTestAllMembers , createTestProject , 
    getInvestorsForMember ,cancelSubscriptionForMember,renewSubscription, upgradePlan ,
    updateEmployee , deleteEmployee, updateLegalDocument, getAllProjectsForMember ,
    updateProject , updateMember , createTestCompany , updateMember} 

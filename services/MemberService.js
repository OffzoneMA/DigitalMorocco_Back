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
    try {
        const members = await Member.find()
                                    .select('owner') 
                                    .populate('owner'); 
        
        return members;
    } catch (error) {
        throw new Error('Error retrieving members: ' + error.message);
    }
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

const createCompany = async (userId, companyData) => {
    try {
        const existingMember = await Member.findOne({ owner: userId });
        const actionType = existingMember?.companyName ? 'company_updated' : 'company_created';
        if (existingMember) {
            existingMember.companyName = companyData.companyName;
            existingMember.legalName = companyData.legalName;
            existingMember.website = companyData.website;
            existingMember.contactEmail = companyData.contactEmail;
            existingMember.desc = companyData.desc;
            existingMember.country = companyData.country;
            existingMember.city = companyData.city?.name;
            existingMember.address = companyData.address,
            existingMember.companyType = companyData.companyType;
            existingMember.taxNbr = companyData.taxIdentfier;
            existingMember.corporateNbr = companyData.corporateNbr;
            existingMember.logo = companyData.logo;

            const savedMember = await existingMember.save();
            await ActivityHistoryService.createActivityHistory(
                userId,
                actionType,
                { targetName: companyData.companyName, targetDesc: `` }
            );
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
        const actionType = existingMember?.companyName ? 'company_updated' : 'company_created';
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
            await ActivityHistoryService.createActivityHistory(
                userId,
                actionType,
                { targetName: companyData.companyName, targetDesc: `` }
            );

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



const CreateMember = async (userId, member) => {
    try {
        return await Member.create({ ...member, owner: userId });
    } catch (error) {
        throw new Error(`Error creating member: ${error.message}`);
    }
};

const CreateMemberWithLogo = async (userId, member, logo) => {
    try {
        // Initialisation de l'objet pour le nouveau membre
        const newMember = { ...member, owner: userId };

        if (logo) {
            const logoLink = await uploadService.uploadFile(logo, `Members/${userId}`, 'logo');
            newMember.logo = logoLink;
        }

        return await Member.create(newMember);
    } catch (error) {
        throw new Error(`Error creating member: ${error.message}`);
    }
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
        const updatedMember = await Member.findByIdAndUpdate(memberId, entreprise);

        await ActivityHistoryService.createActivityHistory(
            member.owner,
            'company_created',
            { targetName: entreprise.companyName, targetDesc: `` }
        );

        return updatedMember;
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
        await ActivityHistoryService.createActivityHistory(
            member.owner,
            'project_created',
            { targetName: project?.name, targetDesc: `and save as Draft` }
        );
    } else {
        // If project exists, update its fields
        const projectfirstName = project?.name;
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
        await ActivityHistoryService.createActivityHistory(
            member.owner,
            'project_updated',
            { targetName: project?.name, targetDesc: `` , to: projectfirstName }
        );
    }

    return project;
};

async function createProject(ownerId, projectData , pitchDeck, businessPlan , financialProjection, documentsFiles , logo) {
    try {

      const member = await Member.findById(ownerId);
      if (!member) {
        throw new Error("Member not found");
    }
      const project = new Project({ owner: ownerId, ...projectData });

      if (logo) {
        let logoLink = await uploadService.uploadFile(logo, "Members/" + member.owner + "/Project_logos", logo.originalname)
        project.logo = logoLink
    }

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
      await ActivityHistoryService.createActivityHistory(
        member.owner,
        'project_created',
        { targetName: project.name, targetDesc: `` }
      );
      return savedProject;
    } catch (error) {
      throw error;
    }
}

async function updateProject(projectId, newData, pitchDeck, businessPlan, financialProjection , documentsFiles , logo) {
    try {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error("Project not found");
        }
        const projectFirstName = project?.name;
        project.name = newData.name || project.name;
        project.funding = newData.funding || project.funding;
        project.totalRaised = newData.totalRaised || project.totalRaised;
        project.currency = newData.currency || project.currency;
        project.details = newData.details || project.details;
        project.stage = newData.stage || project.stage;
        project.visbility = newData.visbility|| project.visbility;
        project.country = newData.country|| project.country;
        project.sector = newData.sector|| project.sector;
        project.website = newData.website || project.website;
        project.contactEmail = newData.contactEmail || project.contactEmail;
        project.listMember = newData.listMember || project.listMember;
        project.status = newData.status || project.status;

        console.log(newData.stage)
        if (newData.milestones) {
            const existingMilestoneNames = project.milestones.map(milestone => milestone.name);
            newData.milestones.forEach(newMilestone => {
              if (!existingMilestoneNames.includes(newMilestone.name)) {
                project.milestones.push(newMilestone);
              }
            });
        }

        // if (newData.listMember) {
        //     // Create a map of new members by personalEmail and workEmail
        //     const newMembersMap = new Map(newData.listMember.map(member => [member.personalEmail + member.workEmail, member]));
        //     // Filter out members that are no longer in the new list
        //     project.listMember = project.listMember.filter(existingMember => {
        //         const key = existingMember.personalEmail + existingMember.workEmail;
        //         return newMembersMap.has(key);
        //     });

        //     // Add or update members
        //     newData.listMember.forEach(newMember => {
        //     const key = newMember.personalEmail + newMember.workEmail;
        //     const existingMemberIndex = project.listMember.findIndex(existingMember => (existingMember.personalEmail + existingMember.workEmail) === key);

        //     if (existingMemberIndex !== -1) {
        //         // Update existing member
        //         project.listMember[existingMemberIndex] = { ...project.listMember[existingMemberIndex], ...newMember };
        //     } else {
        //         // Add new member
        //         project.listMember.push(newMember);
        //     }
        //     });
           
        //   }
        
        if (logo) {
            let logoLink = await uploadService.uploadFile(logo, "Members/" + project.owner + "/Project_logos", logo.originalname)
            project.logo = logoLink
        }

        if (newData?.deletedFiles?.length > 0) {
            const deletedDocumentTypes = new Set(newData?.deletedFiles);

            const documentsToRemove = project.documents.filter(doc => deletedDocumentTypes.has(doc.documentType));
            project.documents = project.documents.filter(doc => !deletedDocumentTypes.has(doc.documentType));
            
            // Remove the files from storage
            await Promise.all(documentsToRemove.map(async (doc) => {
                await uploadService.deleteFile("Members/" + project.owner + "/Project_documents", doc.name);
            }));
        }

        if (newData?.otherDeletedFiles?.length > 0) {
            const deletedDocumentNames = new Set(newData.otherDeletedFiles);
        
            project.documents = project.documents.filter(
                doc => !(doc.documentType === "other" && deletedDocumentNames.has(doc.name))
            );
        
            await Promise.all(newData.otherDeletedFiles.map(async (fileName) => {
                await uploadService.deleteFile("Members/" + project.owner + "/Project_documents", fileName);
            }));
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
        const member = await Member.findById(project?.owner)
        await ActivityHistoryService.createActivityHistory(
            member.owner,
            'project_updated',
            { targetName: projectFirstName, targetDesc: `Project updated for projectId ${projectId}` , to: project?.name }
        );
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
    const member = await Member.findOne({ owner: userId }, 'owner companyName legalName website contactEmail desc address city country companyType taxNbr corporateNbr visbility credits subStatus');
    return member;
}

const getMemberInfoByUserId = async (userId) => {
    const member = await Member.findOne({ owner: userId });
    return member;
}

const getMemberByName = async (name) => {
    return await Member.find({ name: name })
}

const memberByNameExists = async (name) => {
    return await Member.exists({ name: name })
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
        // const subscription = await Subscription.findOne({ member: member._id });
        // if (!subscription) {
        //     return false;
        // }
        // const currentDate = new Date();
        // const expirationDate = new Date(subscription.dateExpired); 
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

  module.exports = {checkMemberStatus, 
    createCompany,  deleteMember, getContacts, getAllMembers, createProject, checkSubscriptionStatus, 
    CreateMember, createEnterprise, getMemberById, memberByNameExists, getMemberByName, getMemberByUserId, 
    checkSubscriptionStatus ,createCompany , getTestAllMembers , createTestProject , getInvestorsForMember ,
     getAllProjectsForMember , updateProject , updateMember , createTestCompany , updateMember , 
     getMemberInfoByUserId , CreateMemberWithLogo} 

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

async function searchMembers(searchTerm) {
    try {
        const regex = new RegExp(searchTerm, 'i'); 
        
        const members = await Member.find({
            $or: [
                { 'companyName': regex }, 
                // { 'contactEmail': regex }, 
                // { 'desc': regex }, 
                // { 'companyType': regex },  
                // { 'address': regex } 
            ]
        }).populate('owner'); 
        
        return members;
    } catch (error) {
        throw new Error('Error searching members: ' + error.message);
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

const createOrUpdateMember = async (userId, companyData, logo) => {
    try {
        const existingMember = await Member.findOne({ owner: userId });
        const actionType = existingMember ? 'company_updated' : 'company_created';

        if (existingMember) {
            existingMember.companyName = companyData.companyName;
            existingMember.legalName = companyData.legalName;
            existingMember.website = companyData.website;
            existingMember.contactEmail = companyData.contactEmail;
            existingMember.desc = companyData.desc;
            existingMember.country = companyData.country;
            existingMember.city = companyData.city?.name;
            existingMember.stage = companyData.stage;
            existingMember.companyType = companyData.companyType;
            existingMember.taxNbr = companyData.taxIdentfier;
            existingMember.corporateNbr = companyData.corporateNbr;
            existingMember.address = companyData.address;

            if (logo) {
                const logoLink = await uploadService.uploadFile(logo, `Members/${existingMember.owner}`, 'logo');
                existingMember.logo = logoLink;
            }

            const savedMember = await existingMember.save();
            await ActivityHistoryService.createActivityHistory(
                userId,
                actionType,
                { targetName: companyData.companyName, targetDesc: `` }
            );

            return {
                message: 'Membre mis à jour avec succès',
                company: savedMember,
            };
        }

        throw new Error("Le membre n'existe pas pour cet utilisateur");
    } catch (error) {
        throw new Error("Impossible de créer ou mettre à jour le membre : " + error.message);
    }
};

const createOrUpdateInvestor = async (userId, companyData, logo) => {
    try {
        const existingInvestor = await Investor.findOne({ owner: userId });
        const actionType = existingInvestor ? 'company_updated' : 'company_created';

        if (existingInvestor) {
            existingInvestor.companyName = companyData.companyName;
            existingInvestor.name = companyData.companyName;
            existingInvestor.legalName = companyData.legalName;
            existingInvestor.website = companyData.website;
            existingInvestor.contactEmail = companyData.contactEmail;
            existingInvestor.emailAddress = companyData.contactEmail;
            existingInvestor.desc = companyData.desc;
            existingInvestor.country = companyData.country;
            existingInvestor.location = companyData.country;
            existingInvestor.city = companyData.city?.name;
            existingInvestor.stage = companyData.stage;
            existingInvestor.companyType = companyData.companyType;
            existingInvestor.type = companyData.companyType;
            existingInvestor.taxNbr = companyData.taxIdentfier;
            existingInvestor.corporateNbr = companyData.corporateNbr;
            existingInvestor.address = companyData.address;

            if (logo) {
                const logoLink = await uploadService.uploadFile(logo, `Investors/${existingInvestor.owner}`, 'logo');
                existingInvestor.image = logoLink;
            }

            const savedInvestor = await existingInvestor.save();
            await ActivityHistoryService.createActivityHistory(
                userId,
                actionType,
                { targetName: companyData.companyName, targetDesc: `` }
            );

            return {
                message: 'Investisseur mis à jour avec succès',
                company: savedInvestor,
            };
        }

        throw new Error("L'investisseur n'existe pas pour cet utilisateur");
    } catch (error) {
        throw new Error("Impossible de créer ou mettre à jour l'investisseur : " + error.message);
    }
};

const createOrUpdatePartner = async (userId, companyData, logo) => {
    try {
        const existingPartner = await Partner.findOne({ owner: userId });
        const actionType = existingPartner ? 'company_updated' : 'company_created';

        if (existingPartner) {
            existingPartner.companyName = companyData.companyName;
            existingPartner.legalName = companyData.legalName;
            existingPartner.website = companyData.website;
            existingPartner.contactEmail = companyData.contactEmail;
            existingPartner.desc = companyData.desc;
            existingPartner.country = companyData.country;
            existingPartner.city = companyData.city?.name;
            existingPartner.stage = companyData.stage;
            existingPartner.companyType = companyData.companyType;
            existingPartner.taxNbr = companyData.taxIdentfier;
            existingPartner.corporateNbr = companyData.corporateNbr;
            existingPartner.address = companyData.address;

            if (logo) {
                const logoLink = await uploadService.uploadFile(logo, `Partners/${existingPartner.owner}`, 'logo');
                existingPartner.logo = logoLink;
            }

            const savedPartner = await existingPartner.save();
            await ActivityHistoryService.createActivityHistory(
                userId,
                actionType,
                { targetName: companyData.companyName, targetDesc: `` }
            );

            return {
                message: 'Partenaire mis à jour avec succès',
                company: savedPartner,
            };
        }

        throw new Error("Le partenaire n'existe pas pour cet utilisateur");
    } catch (error) {
        throw new Error("Impossible de créer ou mettre à jour le partenaire : " + error.message);
    }
};

const createTestCompany = async (userId, role, companyData, logo) => {
    switch (role) {
        case 'member':
            return await createOrUpdateMember(userId, companyData, logo);
        case 'investor':
            return await createOrUpdateInvestor(userId, companyData, logo);
        case 'partner':
            return await createOrUpdatePartner(userId, companyData, logo);
        default:
            throw new Error('Rôle non valide fourni');
    }
};

// const createTestCompany = async (userId, companyData , logo) => {
//     try {
//         const existingMember = await Member.findOne({ owner: userId });
//         const actionType = existingMember?.companyName ? 'company_updated' : 'company_created';
//         if (existingMember) {
//             existingMember.companyName = companyData.companyName;
//             existingMember.legalName = companyData.legalName;
//             existingMember.website = companyData.website;
//             existingMember.contactEmail = companyData.contactEmail;
//             existingMember.desc = companyData.desc;
//             existingMember.country = companyData.country;
//             existingMember.city = companyData.city;
//             existingMember.stage = companyData.stage;
//             existingMember.companyType = companyData.companyType;
//             existingMember.taxNbr = companyData.taxIdentfier;
//             existingMember.corporateNbr = companyData.corporateNbr;

//             if (logo) {
//                 let logoLink = await uploadService.uploadFile(logo, "Members/" + existingMember.owner + "", 'logo')
//                 existingMember.logo = logoLink
//             }

//             const savedMember = await existingMember.save();
//             await ActivityHistoryService.createActivityHistory(
//                 userId,
//                 actionType,
//                 { targetName: companyData.companyName, targetDesc: `` }
//             );

//             return {
//                 message: 'Nouvelle entreprise ajoutée avec succès',
//                 company: savedMember,
//             };
//         }
//         throw new Error("Le membre n'existe pas pour cet utilisateur");
//     } catch (error) {
//         throw new Error("Impossible de créer l'entreprise : " + error.message);
//     }
// };

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

async function createProject(ownerId, projectData, pitchDeck, businessPlan, financialProjection, documentsFiles, logo) {
    try {
        const member = await Member.findById(ownerId);
        if (!member) {
            throw new Error("Member not found");
        }

        const project = new Project({ 
            owner: ownerId, 
            ...projectData,
            documents: []
        });

        const documents = [];
        
        // Gérer le logo séparément
        if (logo) {
            try {
                 // Supprimer l'ancien logo s'il existe
                 if (project.logo) {
                    const oldLogoName = getFileNameFromURL(project.logo);
                    if (oldLogoName) {
                        await uploadService.deleteFile(oldLogoName, `Members/${member.owner}/Project_logos`);
                        console.log('file deleted')
                    }
                }

                const uniqueLogoName = generateUniqueFileName(logo.originalname);
                const logoLink = await uploadService.uploadFile(
                    logo, 
                    `Members/${member.owner}/Project_logos`, 
                    uniqueLogoName
                );
                project.logo = logoLink;
            } catch (error) {
                console.error('Logo upload failed:', error);
                throw new Error('Logo upload failed');
            }
        }

        // Fonction d'upload unique pour tous les types de documents
        async function uploadDocument(file, documentType = "other") {
            if (!file) return null;
            
            try {
                const uniqueFileName = generateUniqueFileName(file.originalname);
                const fileLink = await uploadService.uploadFile(
                    file, 
                    `Members/${member.owner}/Project_documents`, 
                    uniqueFileName
                );
                
                return {
                    name: file.originalname,
                    link: fileLink,
                    type: file.mimetype,
                    documentType
                };
            } catch (error) {
                console.error(`Upload failed for ${file.originalname}:`, error);
                throw new Error(`Upload failed for ${file.originalname}`);
            }
        }

        // Upload des documents spéciaux un par un
        const specialDocs = [
            { file: pitchDeck, type: "pitchDeck" },
            { file: businessPlan, type: "businessPlan" },
            { file: financialProjection, type: "financialProjection" }
        ];

        for (const { file, type } of specialDocs) {
            if (file) {
                const doc = await uploadDocument(file, type);
                if (doc) documents.push(doc);
            }
        }

        // Upload des documents additionnels un par un
        if (Array.isArray(documentsFiles)) {
            for (const file of documentsFiles) {
                const doc = await uploadDocument(file);
                if (doc) documents.push(doc);
            }
        }

        // Assigner tous les documents
        project.documents = documents;

        // Sauvegarder le projet
        const savedProject = await project.save();

        // Créer l'historique d'activité
        await ActivityHistoryService.createActivityHistory(
            member.owner,
            'project_created',
            { 
                targetName: project.name, 
                targetDesc: `Project created successfully with ${documents.length} documents` 
            }
        );

        return savedProject;

    } catch (error) {
        console.error('Project creation error:', error);
        throw new Error(`Failed to create project: ${error.message}`);
    }
}


async function updateProject(projectId, newData, pitchDeck, businessPlan, financialProjection, documentsFiles, logo) {
    try {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error("Project not found");
        }

        const projectFirstName = project.name;
        
        // Mettre à jour les champs de base
        const fieldsToUpdate = [
            'name', 'funding', 'totalRaised', 'currency', 'details', 
            'stage', 'visbility', 'country', 'sector', 'website', 
            'contactEmail', 'listMember', 'status'
        ];

        fieldsToUpdate.forEach(field => {
            if (newData[field] !== undefined) {
                project[field] = newData[field];
            }
        });

        // Gérer les milestones
        if (newData.milestones) {
            const existingMilestoneNames = new Set(project.milestones.map(m => m.name));
            const newMilestones = newData.milestones.filter(m => !existingMilestoneNames.has(m.name));
            project.milestones.push(...newMilestones);
        }

        const newDocuments = [...project.documents];

        // Gérer le logo séparément
        if (logo) {
            try {
                const uniqueLogoName = generateUniqueFileName(logo.originalname);
                const logoLink = await uploadService.uploadFile(
                    logo, 
                    `Members/${project.owner}/Project_logos`, 
                    uniqueLogoName
                );
                project.logo = logoLink;
            } catch (error) {
                console.error('Logo upload failed:', error);
                throw new Error('Logo upload failed');
            }
        }

        // Fonction d'upload unique
        async function uploadDocument(file, documentType = "other") {
            if (!file) return null;

            try {
                const uniqueFileName = generateUniqueFileName(file.originalname);
                const fileLink = await uploadService.uploadFile(
                    file,
                    `Members/${project.owner}/Project_documents`,
                    uniqueFileName
                );

                return {
                    name: file.originalname,
                    link: fileLink,
                    type: file.mimetype,
                    documentType
                };
            } catch (error) {
                console.error(`Upload failed for ${file.originalname}:`, error);
                throw new Error(`Upload failed for ${file.originalname}`);
            }
        }

        // Upload et mise à jour des documents spéciaux
        const specialDocs = [
            { file: pitchDeck, type: "pitchDeck" },
            { file: businessPlan, type: "businessPlan" },
            { file: financialProjection, type: "financialProjection" }
        ];

        for (const { file, type } of specialDocs) {
            if (file) {
                const doc = await uploadDocument(file, type);
                if (doc) {
                    const existingIndex = newDocuments.findIndex(d => d.documentType === type);
                    if (existingIndex !== -1) {
                        newDocuments[existingIndex] = doc;
                    } else {
                        newDocuments.push(doc);
                    }
                }
            }
        }

        // Upload et mise à jour des documents additionnels
        if (Array.isArray(documentsFiles)) {
            for (const file of documentsFiles) {
                const isFileExists = newDocuments.some(doc => doc.name === file.originalname);
                if (!isFileExists) {
                    const doc = await uploadDocument(file);
                    if (doc) newDocuments.push(doc);
                }
            }
        }

        // Mettre à jour les documents
        project.documents = newDocuments;

        // Sauvegarder les modifications
        const updatedProject = await project.save();

        // Créer l'historique d'activité
        const member = await Member.findById(project.owner);
        await ActivityHistoryService.createActivityHistory(
            member.owner,
            'project_updated',
            { 
                targetName: projectFirstName, 
                targetDesc: `Project updated for projectId ${projectId}`,
                to: project.name 
            }
        );

        return updatedProject;

    } catch (error) {
        console.error('Project update error:', error);
        throw new Error(`Failed to update project: ${error.message}`);
    }
}

async function getAllProjectsForMember(memberId, args) {
    try {
        const page = args.page || 1;
        const pageSize = args.pageSize || 8;
        const skip = (page - 1) * pageSize;

        const filter = { owner: memberId };

        if (args.visibility) {
            filter.visibility = args.visibility;
        }

        if (args.status) {
            filter.status = args.status;
        }

        if (args.date && args?.date !== 'Invalid Date') {
            const date = new Date(args.date);
            filter.dateCreated = { $gte: date };
        }

        const totalCount = await Project.countDocuments(filter);
        const totalPages = Math.ceil(totalCount / pageSize);
        
        const projects = await Project.find(filter)
            .skip(skip)
            .sort({ dateCreated: 'desc' })
            .limit(pageSize);
        return { projects, totalPages };
    } catch (error) {
        throw new Error('Error fetching projects for member: ' + error.message);
    }
}

async function getAllProjectsForMemberWithoutPagination(memberId , args) {
    try {
        const filter = { owner: memberId };

        if (args.visibility) {
            filter.visibility = args.visibility;
        }

        if (args.status) {
            filter.status = args.status;
        }

        if (args.date) {
            const date = new Date(args.date);
            filter.dateCreated = { $gte: date };
        }
        const projects = await Project.find(filter).sort({ dateCreated: 'desc' });
        return projects;
    } catch (error) {
        throw new Error('Error fetching projects for member: ' + error.message);
    }
}

async function searchProjects(user, searchQuery) {
    try {
        const filter = {};

        if (user?.role?.toLowerCase() === 'member') {
            const member = await getMemberByUserId(user?._id)
            filter.owner = member._id;
        }

        if (searchQuery) {
            filter.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },  
                { details: { $regex: searchQuery, $options: 'i' } }  
            ];
        }

        const projects = await Project.find(filter);
        return projects;
    } catch (error) {
        throw new Error('Error searching projects');
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
    const member = await Member.findOne({ owner: userId });
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

// const getInvestorsForMember = async (memberId, args) => {
//     try {
//         const member = await Member.findById(memberId);

//         if (!member) {
//             throw new Error('Member not found');
//         }
//         const investorIdsSet = new Set(member.investorsRequestsAccepted);
//         const uniqueInvestorIds = Array.from(investorIdsSet);

//         const page = args?.page || 1;
//         const pageSize = args?.pageSize || 8;
//         const skip = (page - 1) * pageSize;

//         // Construire le filtre
//         const filter = { _id: { $in: uniqueInvestorIds } };

//         if (args.type) {
//             filter.type = { $in: args.type.split(',') }; 
//         }

//         if (args.location) {
//             filter.location = { $regex: new RegExp(args.location, 'i') };
//         }

//         if (args.industries && args.industries.length > 0) {
//             filter.PreferredInvestmentIndustry = { $in: args.industries.split(',') };
//         }

//         const totalCount = await Investor.countDocuments(filter);
//         const totalPages = Math.ceil(totalCount / pageSize);

//         const investors = await Investor.find(filter)
//             .skip(skip)
//             .limit(pageSize);

//         return { investors, totalPages };
//     } catch (error) {
//         throw new Error('Error retrieving investors for member: ' + error.message);
//     }
// };

const getInvestorsForMember = async (memberId, args) => {
    const page = parseInt(args.page, 10) || 1;  
    const pageSize = parseInt(args.pageSize, 10) || 10;
    const skip = (page - 1) * pageSize;

    let investorQuery = {};

    // Filtrage par type d'investissement (plusieurs types)
    if (args?.type && args.type.length > 0) {
        investorQuery.type = { $in: args.type.split(',') };
    }

    // Filtrage par pays (un seul pays)
    if (args?.location) {
        investorQuery.$or = [
            { country: args.location },
            { location: args.location }
        ];
    }

    // Filtrage par secteur d'industrie préféré (plusieurs secteurs)
    if (args?.industries && args.industries.length > 0) {
        investorQuery.PreferredInvestmentIndustry = { $in: args.industries.split(',') };
    }

    const investors = await Investor.find(investorQuery).select('_id');
    const investorIds = investors.map(investor => investor._id);

    const query = {
        member: memberId,
        status: { $in: ['Accepted', 'Approved'] },
    };

    if (investorIds.length > 0) {
        query.investor = { $in: investorIds };
    } else {
        return { investors: [], totalPages: 0, currentPage: 1 };
    }

    // Compter le nombre total de documents correspondants
    const totalCount = await ContactRequest.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize);

    const currentPage = page > totalPages ? 1 : page;  
    const finalSkip = (currentPage - 1) * pageSize;

    const contactRequests = await ContactRequest.find(query)
        .populate({
            path: 'investor',
            model: 'Investor',
        })
        .sort({ dateCreated: 'desc' })
        .skip(finalSkip)
        .limit(pageSize);

    // Supprimer les doublons d'investisseurs par leur _id
    const uniqueInvestors = [];
    const seenIds = new Set();

    for (const request of contactRequests) {
        const investor = request.investor;
        if (investor && !seenIds.has(investor._id.toString())) {
            uniqueInvestors.push(investor);
            seenIds.add(investor._id.toString());
        }
    }

    return { investors: uniqueInvestors, totalPages, currentPage };  
};


const getInvestorsForMemberWithoutPagination = async (memberId) => {
    try {
        // Rechercher toutes les demandes de contact approuvées ou acceptées pour un membre donné
        const contactRequests = await ContactRequest.find({
            member: memberId,
            status: { $in: ['Accepted', 'Approved'] }
        }).populate({
            path: 'investor',
            model: 'Investor'
        }).sort({ dateCreated: 'desc' });

        // Extraire les investisseurs et supprimer les doublons
        const investors = contactRequests.map(request => request.investor);
        const uniqueInvestors = [];
        const seenIds = new Set();

        for (const investor of investors) {
            if (investor && !seenIds.has(investor._id.toString())) {
                uniqueInvestors.push(investor);
                seenIds.add(investor._id.toString());
            }
        }

        return uniqueInvestors;
    } catch (error) {
        throw new Error('Error retrieving investors: ' + error.message);
    }
};

const getContactRequestsForMember = async (memberId, args) => {
    // Pagination
    const requestedPage = parseInt(args.page, 10) || 1;
    const pageSize = parseInt(args.pageSize, 10) || 10;
    const skip = (requestedPage - 1) * pageSize;

    // Construire le filtre de recherche
    const query = { member: memberId };

    // Filtrage par nom d'investisseur (plusieurs noms)
    let investorIds = [];
    if (args?.investorNames) {
        const investorNamesArray = Array.isArray(args.investorNames) ? args.investorNames : args.investorNames.split(',');
        
        if (investorNamesArray.length > 0) {
            const investors = await Investor.find({ name: { $in: investorNamesArray } }).select('_id');
            investorIds = investors.map(investor => investor._id);
            
            if (investorIds.length > 0) {
                query.investor = { $in: investorIds };
            } else {
                return { contactRequests: [], totalPages: 0, currentPage: 1 };
            }
        }
    }

    // Filtrage par statut de la demande (plusieurs statuts)
    if (args?.status) {
        const statusArray = Array.isArray(args.status) ? args.status : args.status.split(',');
        if (statusArray.length > 0) {
            query.status = { $in: statusArray };
        }
    }

    // Compter le nombre total de documents correspondants
    const totalCount = await ContactRequest.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize);

    // Si la page demandée dépasse le nombre total de pages, retourner la première page
    const currentPage = requestedPage > totalPages ? 1 : requestedPage;
    const finalSkip = (currentPage - 1) * pageSize;

    // Récupérer les demandes de contact
    const contactRequests = await ContactRequest.find(query)
        .populate({ path: 'investor', model: 'Investor' })
        .populate({ path: 'member' })
        .populate({ path: 'project', model: 'Project' })
        .skip(finalSkip)
        .limit(pageSize)
        .sort({ dateCreated: 'desc' });

    return { contactRequests, totalPages, currentPage };
};

const getDistinctInvestorsValuesForMember = async (memberId, field) => {

    try {
        // Récupérer tous les investisseurs associés au membre dans ContactRequest avec status 'Approved' ou 'Accepted'
        const contactRequests = await ContactRequest.find({
            member: memberId,
            status: { $in: ['Approved', 'Accepted'] }
        }).select('investor');

        if (!contactRequests || contactRequests.length === 0) {
            throw new Error('No approved or accepted contact requests found for the member');
        }

        // Extraire les identifiants des investisseurs et les dédupliquer
        const investorIds = [...new Set(contactRequests.map(request => request.investor))];

        // Si le champ est 'PreferredInvestmentIndustry', utiliser l'aggregation pour obtenir les valeurs distinctes
        if (field === 'PreferredInvestmentIndustry') {
            const distinctValues = await Investor.aggregate([
                { $match: { _id: { $in: investorIds } } },
                { $unwind: '$PreferredInvestmentIndustry' },
                { $group: { _id: '$PreferredInvestmentIndustry' } },
                { $project: { _id: 0, value: '$_id' } }
            ]);
            return distinctValues.map(item => item.value); // Retourner un tableau des valeurs distinctes
        }

        // Sinon, utiliser distinct pour récupérer les valeurs uniques du champ spécifié
        const distinctValues = await Investor.distinct(field, { _id: { $in: investorIds } });
        return distinctValues;

    } catch (error) {
        throw new Error('Error retrieving distinct values for member: ' + error.message);
    }
};

const searchInvestorsForMember = async (user, searchQuery) => {
    try {
        const member = await getMemberByUserId(user?._id);

        if (!member) {
            throw new Error('Member not found');
        }

        const investorIdsSet = new Set(member.investorsRequestsAccepted);
        const uniqueInvestorIds = Array.from(investorIdsSet);

        const regex = new RegExp(searchQuery, 'i');

        const investors = await Investor.find({ 
            _id: { $in: uniqueInvestorIds },
            $or: [
                { name: regex },       
                // { companyName: regex },          
                // { companyType: regex },    
                // { contactEmail: regex },    
                // { desc: regex },    
            ]
        });
        return investors;
    } catch (error) {
        throw new Error('Error searching investors for member: ' + error.message);
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

// Utilitaire pour générer un nom de fichier unique
const generateUniqueFileName = (originalName) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${timestamp}-${random}.${extension}`;
};

// Fonction utilitaire pour extraire le nom du fichier depuis l'URL Firebase
const getFileNameFromURL = (url) => {
    try {
        const decodedUrl = decodeURIComponent(url);
        const matches = decodedUrl.match(/([^\/]+)(?=\?|$)/);
        return matches ? matches[0] : null;
    } catch (error) {
        console.error('Error extracting filename from URL:', error);
        return null;
    }
};

// Fonction utilitaire pour extraire le chemin depuis l'URL Firebase
const getPathFromUrl = (url) => {
    try {
        const decodedUrl = decodeURIComponent(url);
        const matches = decodedUrl.match(/o\/(.+?)\/[^/?#]+[^/]*$/);
        return matches ? matches[1] : null;
    } catch (error) {
        console.error('Error extracting path from URL:', error);
        return null;
    }
};

  module.exports = {checkMemberStatus, 
    createCompany,  deleteMember, getContacts, getAllMembers, createProject, checkSubscriptionStatus, 
    CreateMember, createEnterprise, getMemberById, memberByNameExists, getMemberByName, getMemberByUserId, 
    checkSubscriptionStatus ,createCompany , getTestAllMembers , createTestProject , getInvestorsForMember ,
     getAllProjectsForMember , updateProject , updateMember , createTestCompany , updateMember , 
     getMemberInfoByUserId , CreateMemberWithLogo , searchProjects , searchMembers , searchInvestorsForMember , 
     getDistinctInvestorsValuesForMember , getAllProjectsForMemberWithoutPagination , 
    getContactRequestsForMember , getInvestorsForMemberWithoutPagination} 


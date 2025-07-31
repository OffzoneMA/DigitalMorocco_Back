const EmailingService = require("./EmailingService");
const Investor = require("../models/Investor");
const Member = require("../models/Member");
const ContactRequest = require("../models/ContactRequest");
const Subscription = require('../models/Subscription');
const MemberService = require("./MemberService");
const InvestorService = require("./InvestorService");
const UserService = require("./UserService");
const ProjectService = require("./ProjectService");
const SubscriptionService = require('../services/SubscriptionService');
const ActivityHistoryService = require('../services/ActivityHistoryService');
const uploadService = require('./FileService')
const Project = require('../models/Project');
const User = require("../models/User");
const NotificationService = require('../services/NotificationService');

const CreateInvestorContactReq = async (memberId, investorId) => {
    const cost = 320
    const delay = process.env.Contact_Delay_After_Reject_by_days || 180
    const member = await MemberService.getMemberById(memberId)
    const investor = await InvestorService.getInvestorById(investorId)
    const subscription = await SubscriptionService.getSubscriptionsByUser(member?.owner)

    if (!member || !investor) {
        throw new Error("member Or Investor doesn't exist")
    }

    const request = await ContactRequest.find({ $and: [{ status: { $in: ["pending", "accepted"] } }, { member: memberId }, { investor: investorId }] })
    if (request.length>0) {
        throw new Error('Request already exists')
    }

    //Checks delay expiration
    const latestRejectedContactRequest = await ContactRequest
        .find({ $and: [{ status: 'rejected' }, { member: memberId }, { investor: investorId }] })
        .sort({ dateCreated: -1 })
        .limit(1);
    if (latestRejectedContactRequest.length>0) {
        const daysDiff = await DiffDate(latestRejectedContactRequest[0].dateCreated)
        //daysDiff < delay  Means still have to wait to make a contact request
        if (daysDiff < delay){
            throw new Error("You can't make a contact request to this investor, " + (delay - daysDiff)+" day(s) remaining!" )
        }
       
    }

    if (subscription?.subscriptionStatus !== "active") {
        throw new Error('Must Subscribe !')
    }
    if (subscription?.totalCredits < cost) {
        throw new Error('Not Enough Credits!')
    }
    const contact = await ContactRequest.create({ member: memberId, investor: investorId, cost: cost })

    const updateMember = {
        $push: { investorsRequestsPending: investorId }
    };
    const updateInvestor = {
        $push: { membersRequestsPending: memberId },
    };

    const updatedInvestor = await Investor.findByIdAndUpdate(investorId, updateInvestor)
    const updatedMember = await Member.findByIdAndUpdate(memberId, updateMember)

    await Subscription.findByIdAndUpdate(subscription._id, {
        $inc: { totalCredits: -cost }
    });

    const historyData = {
        targetName: `${investor.name}`, 
        targetDesc: `Sent a contact request to investor ${investor._id}`
    };
    
    // Log the activity in the history
    await ActivityHistoryService.createActivityHistory(
        member?.owner,
        'contact_request_sent', 
        historyData 
    );

    // await NotificationService.createNotification(investor?.owner , '' , '' , member?.owner , '' ,'')

    //Send Email Notification to the investor
    await EmailingService.sendNewContactRequestEmail(investor?.owner, member?.companyName, member?.country);


    return contact
}

const CreateInvestorContactReqForProject = async (memberId, investorId , projectId , document , data) => {
    const cost = process.env.credits || 3
    const delay = process.env.Contact_Delay_After_Reject_by_days || 180
    const member = await MemberService.getMemberById(memberId)
    const investor = await InvestorService.getInvestorById(investorId)
    const project = await ProjectService.getProjectById(projectId) 
    const subscription = await SubscriptionService.getSubscriptionsByUser(member?.owner);

    if (!member || !investor || !project) {
        throw new Error("member Or Investor Or Project doesn't exist")
    }

    const request = await ContactRequest.find({ $and: [{ status: { $in: ["Pending", "Accepted"] } }, { member: memberId }, { investor: investorId } , {project: projectId}] })
    if (request.length>0) {
        throw new Error('Request already exists')
    }

    //Checks delay expiration
    const latestRejectedContactRequest = await ContactRequest
        .find({ $and: [{ status: 'Rejected' }, { member: memberId }, { investor: investorId } , {project: projectId}] })
        .sort({ dateCreated: -1 })
        .limit(1);
    if (latestRejectedContactRequest.length>0) {
        const daysDiff = await DiffDate(latestRejectedContactRequest[0].dateCreated)
        //daysDiff < delay  Means still have to wait to make a contact request
        if (daysDiff < delay){
            throw new Error("You can't make a contact request to this investor, " + (delay - daysDiff)+" day(s) remaining!" )
        }
       
    }

    if (subscription?.subscriptionStatus !== "active") {
        throw new Error('Must Subscribe !')
    }
    if (subscription?.totalCredits < cost) {
        throw new Error('Not Enough Credits!')
    }

    let docLink = null;

    if (document) {
        docLink = await uploadService.uploadFile(document, `Members/${member?.owner}/Project_documents`, document.originalname);
    }

    const contactRequestData = {
        member: memberId,
        investor: investorId,
        project: projectId,
        cost,
        document: docLink ? {
            name: document.originalname,
            link: docLink,
            mimeType: document.mimetype
        } : undefined,
        requestLetter: data,
    };
    const contact = new ContactRequest(contactRequestData);
    await contact.save();

    const updateMember = {
        $push: { investorsRequestsPending: investorId }
    };

    const updateInvestor = {
        $push: { membersRequestsPending: memberId },
    };

    const updatedInvestor = await Investor.findByIdAndUpdate(investorId, updateInvestor)
    const updatedMember = await Member.findByIdAndUpdate(memberId, updateMember)
    
    await Subscription.findByIdAndUpdate(subscription._id, {
        $inc: { totalCredits: -cost }
    });

    await ActivityHistoryService.createActivityHistory(
        member?.owner,
        'contact_sent',
        { targetName: `${investor?.companyName || investor?.name}`, targetDesc: `Contact request from member to investor ${investorId} for project ${projectId}` , for: project?.name }
    );

    await ActivityHistoryService.createActivityHistory(
        investor?.owner,
        'contact_request_received',
        { targetName: `${project?.name}`, targetDesc: `Contact request received from member ${memberId} for project ${projectId}` , from: member?.companyName }
    );

    await NotificationService.createNotification(investor?.owner , 'Contact request received for project' , 'from' , project?._id , project?.name , member?.companyName , member?.owner)


    //Send Email Notification to the investor
    // await EmailingService.sendNewContactRequestEmail(investor.owner, member?.companyName, member?.country);

    return contact
}

// First part: Deduct credits and create draft contact request
const CreateDraftContactRequest = async (memberId, investorId) => {
    const cost = 320;
    const member = await MemberService.getMemberById(memberId);
    const investor = await InvestorService.getInvestorById(investorId);
    const subscription = await SubscriptionService.getSubscriptionsByUser(member?.owner);
    if (!member) {
        throw new Error("Member doesn't exist");
    }

    if (!investor ) {
        throw new Error("Investor  doesn't exist");
    }

    if (subscription?.subscriptionStatus !== "active") {
        throw new Error("Must subscribe!");
    }
    if (subscription?.totalCredits < cost) {
        throw new Error("Not enough credits!");
    }

    // Deduct credits and create contact request with "Draft" status
    await Subscription.findByIdAndUpdate(subscription._id, {
        $inc: { totalCredits: -cost }
    });

    const contactRequestData = {
        member: memberId,
        investor: investorId,
        cost,
        status: "Draft"
    };
    const contact = new ContactRequest(contactRequestData);
    await contact.save();

    return contact;
};


const FinalizeContactRequest = async (contactRequestId, projectId, document, data) => {
    const contactRequest = await ContactRequest.findById(contactRequestId);
    const member = await MemberService.getMemberById(contactRequest?.member);
    const investor = await InvestorService.getInvestorById(contactRequest?.investor);
    if (!contactRequest || contactRequest.status !== "Draft") {
        throw new Error("Invalid contact request or status is not 'Draft'");
    }

    const project = await ProjectService.getProjectById(projectId);
    if (!project) {
        throw new Error("Project doesn't exist");
    }

    let docLink = null;
    if (document) {
        docLink = await uploadService.uploadFile(document, `Members/${contactRequest.member}/Project_documents`, document.originalname);
    }

    const updateData = {
        project: projectId,
        document: docLink ? {
            name: document.originalname,
            link: docLink,
            mimeType: document.mimetype
        } : undefined,
        requestLetter: data,
        status: "In Progress" ,
        dateCreated : new Date()
    };

    // Update the contact request with project and document details
    await ContactRequest.findByIdAndUpdate(contactRequestId, updateData);

    await ActivityHistoryService.createActivityHistory(
        member.owner,
        'contact_sent',
        { targetName: `${investor?.companyName || investor?.name}`, targetDesc: `Contact request from member to investor ${investor?._id} for project ${projectId}` , for: project?.name }
    );

    await ActivityHistoryService.createActivityHistory(
        investor.owner,
        'contact_request_received',
        { targetName: `${project?.name}`, targetDesc: `Contact request received from member ${member?._id} for project ${projectId}` , from: member?.companyName }
    );

    await NotificationService.createNotification(investor?.owner , 'Contact request received for project' , 'from' , project?._id , project?.name , member?.companyName , member?.owner)


    return await ContactRequest.findById(contactRequestId); 
};


// const shareProjectWithInvestors = async (projectId, memberId, investorIds) => {
//     const project = await ProjectService.getProjectById(projectId);
//     if (!project) {
//         throw new Error("Project doesn't exist");
//     }

//     const member = await MemberService.getMemberById(memberId);
//     if (!member) {
//         throw new Error("Member doesn't exist");
//     }

//     const subscription = await SubscriptionService.getSubscriptionsByUser(member.owner);

//     const cost = process.env.Share_Project_Cost || 100;
//     const delay = process.env.Contact_Delay_After_Reject_by_days || 180;

//     if (subscription?.subscriptionStatus !== "active") {
//         throw new Error('Must Subscribe!');
//     }

//     if (subscription?.totalCredits < cost * investorIds.length) {
//         throw new Error('Not Enough Credits!');
//     }

//     const results = [];

//     for (const investorId of investorIds) {
//         const investor = await InvestorService.getInvestorById(investorId);
//         if (!investor) {
//             results.push({ investorId, status: "Investor doesn't exist" });
//             continue;
//         }

//         const existingRequest = await ContactRequest.findOne({ member: memberId, investor: investorId, status: { $in: ["pending", "accepted"]} , project: projectId });
//         if (existingRequest) {
//             results.push({ investorId, status: 'Request already exists' });
//             continue;
//         }

//         const latestRejectedRequest = await ContactRequest.findOne({ member: memberId, investor: investorId, status: 'rejected' , project: projectId }).sort({ dateCreated: -1 });
//         if (latestRejectedRequest) {
//             const daysDiff = (new Date() - latestRejectedRequest.dateCreated) / (1000 * 60 * 60 * 24);
//             if (daysDiff < delay) {
//                 results.push({ investorId, status: `Can't make a contact request, ${Math.ceil(delay - daysDiff)} day(s) remaining` });
//                 continue;
//             }
//         }

//         const contact = await ContactRequest.create({ member: memberId, investor: investorId, cost , project: projectId});
//         await Member.findByIdAndUpdate(memberId, { $push: { investorsRequestsPending: investorId }});
//         await Investor.findByIdAndUpdate(investorId, { $push: { membersRequestsPending: memberId } });
//         await Project.findByIdAndUpdate(projectId , {$push : {shareWithInvestors: investorId}} );
        
//         await Subscription.findByIdAndUpdate(subscription._id, {
//             $inc: { totalCredits: -cost }
//         });

//         // await ActivityHistoryService.createActivityHistory(
//         //     member.owner,
//         //     'project_shared',
//         //     { targetName: `${project?.name}`, targetDesc: `Project shared from member ${memberId} for project ${projectId}` , from: member?.companyName }
//         // );
//         // await EmailingService.sendNewProjectShareRequestEmail(investor.owner, member.companyName, member.country, project);

//         results.push({ investorId, status: 'Request sent successfully' });
//     }

//     await ActivityHistoryService.createActivityHistory(
//         member?.owner,
//         'project_shared',
//         { targetName: `${project?.name}`, targetDesc: `Project ${projectId} shared with investors` }
//     );

//     return results;
// };

const shareProjectWithInvestors = async (projectId, memberId, investorIds) => {
    // Vérification préliminaire
    const [project, member] = await Promise.all([
        ProjectService.getProjectById(projectId),
        MemberService.getMemberById(memberId),
    ]);

    if (!project) throw new Error("Project doesn't exist");
    if (!member) throw new Error("Member doesn't exist");

    const subscription = await SubscriptionService.getSubscriptionsByUser(member.owner);
    const cost = parseInt(process.env.Share_Project_Cost, 10) || 100;
    const delay = parseInt(process.env.Contact_Delay_After_Reject_by_days, 10) || 180;

    if (!subscription || subscription.subscriptionStatus !== "active") {
        throw new Error('Must Subscribe!');
    }

    if (subscription.totalCredits < cost * investorIds.length) {
        throw new Error('Not Enough Credits!');
    }

    const investors = await Investor.find({ _id: { $in: investorIds } });
    const validInvestorIds = investors.map(inv => inv._id.toString());

    const results = await Promise.all(
        investorIds.map(async (investorId) => {
            if (!validInvestorIds.includes(investorId)) {
                return { investorId, status: "Investor doesn't exist" };
            }

            const [existingRequest, latestRejectedRequest] = await Promise.all([
                ContactRequest.findOne({
                    member: memberId,
                    investor: investorId,
                    project: projectId,
                    status: { $in: ["pending", "accepted"] },
                }),
                ContactRequest.findOne({
                    member: memberId,
                    investor: investorId,
                    project: projectId,
                    status: 'rejected',
                }).sort({ dateCreated: -1 }),
            ]);

            if (existingRequest) {
                return { investorId, status: 'Request already exists' };
            }

            if (latestRejectedRequest) {
                const daysDiff = (new Date() - new Date(latestRejectedRequest.dateCreated)) / (1000 * 60 * 60 * 24);
                if (daysDiff < delay) {
                    return { investorId, status: `Can't make a contact request, ${Math.ceil(delay - daysDiff)} day(s) remaining` };
                }
            }

            await Promise.all([
                ContactRequest.create({ member: memberId, investor: investorId, cost, project: projectId }),
                Member.findByIdAndUpdate(memberId, { $addToSet: { investorsRequestsPending: investorId } }),
                Investor.findByIdAndUpdate(investorId, { $addToSet: { membersRequestsPending: memberId } }),
                Project.findByIdAndUpdate(projectId, { $addToSet: { shareWithInvestors: investorId } }),
                Subscription.findByIdAndUpdate(subscription._id, { $inc: { totalCredits: -cost } }),
            ]);

            return { investorId, status: 'Request sent successfully' };
        })
    );

    await ActivityHistoryService.createActivityHistory(
        member.owner,
        'project_shared',
        { targetName: project.name, targetDesc: `Project ${projectId} shared with investors` }
    );

    return results;
};


const getAllContactRequest = async (args, role, id) => {
    try {
      const requestedPage = parseInt(args?.page, 10) || 1;
      const pageSize = parseInt(args?.pageSize, 10) || 8;
      const skip = (requestedPage - 1) * pageSize;
  
      // Construire le filtre de recherche
      const query = {};
      if (role === "member") query.member = id;
      if (role === "investor") query.investor = id;
  
      // Filtrer par statut (plusieurs valeurs)
      if (args?.status && args.status.length > 0) {
        query.status = { $in: args.status.split(',') };
      }
  
      // Filtrage par date de création (si la date est valide)
      if (args?.dateCreated && args?.dateCreated !== 'Invalid Date') {
        const startOfDay = new Date(args.dateCreated);
        startOfDay.setHours(0, 0, 0, 0);  // Début de la journée
        const endOfDay = new Date(args.dateCreated);
        endOfDay.setHours(23, 59, 59, 999);  // Fin de la journée
  
        query.dateCreated = { $gte: startOfDay, $lte: endOfDay };
      }
  
      // Construire les filtres de projet (en plusieurs étapes)
      let projectFilter = [];
  
      // Filtrage par secteurs de projets
      if (args?.projectSectors && args.projectSectors.length > 0) {
        const projectQueryBySectors = await Project.find({
          sector: { $in: args.projectSectors.split(',') } , status: { $ne: "Draft" }
        }).select('_id');
  
        const projectIdsBySectors = projectQueryBySectors.map(project => project._id);
        if (projectIdsBySectors.length > 0) {
          projectFilter.push({ project: { $in: projectIdsBySectors } });
        }
      }
  
      // Filtrage par financement
      if (args?.funding) {
        const projectQueryByFunding = await Project.find({
          funding: args.funding , status: { $ne: "Draft" }
        }).select('_id');
  
        const projectIdsByFunding = projectQueryByFunding.map(project => project._id);
        if (projectIdsByFunding.length > 0) {
          projectFilter.push({ project: { $in: projectIdsByFunding } });
        }
      }
  
      // Filtrage par pays
      if (args?.country) {
        const projectQueryByCountry = await Project.find({
          country: args.country , status: { $ne: "Draft" }
        }).select('_id');
  
        const projectIdsByCountry = projectQueryByCountry.map(project => project._id);
        if (projectIdsByCountry.length > 0) {
          projectFilter.push({ project: { $in: projectIdsByCountry } });
        }
      }
  
      // Filtrage par stade de projet
      if (args?.projectStage) {
        const projectQueryByStage = await Project.find({
          stage: args.projectStage , status: { $ne: "Draft" }
        }).select('_id');
  
        const projectIdsByStage = projectQueryByStage.map(project => project._id);
        if (projectIdsByStage.length > 0) {
          projectFilter.push({ project: { $in: projectIdsByStage } });
        }
      }
  
      // Filtrage par statut de projet
      if (args?.projectStatus && args.projectStatus.length > 0) {
        const projectQueryByStatus = await Project.find({
          status: { $in: args.projectStatus.split(',') } , status: { $ne: "Draft" }
        }).select('_id');
  
        const projectIdsByStatus = projectQueryByStatus.map(project => project._id);
        if (projectIdsByStatus.length > 0) {
          projectFilter.push({ project: { $in: projectIdsByStatus } });
        }
      }
  
      // Ajouter le filtre de projet dans la requête globale si applicable
      if (projectFilter.length > 0) {
        query.$or = projectFilter;
      }
  
      // Compter le nombre total de documents pour la pagination
      const totalCount = await ContactRequest.countDocuments(query);
      const totalPages = Math.ceil(totalCount / pageSize);
  
      // Vérifier la page actuelle pour s'assurer qu'elle ne dépasse pas le nombre de pages total
      const currentPage = requestedPage > totalPages ? 1 : requestedPage;
  
      // Récupérer les demandes de contact avec peu de détails pour améliorer les performances
      const ContactsHistory = await ContactRequest.find(query)
        .populate(role === "member" ? {
          path: 'investor',
          model: 'Investor',
          select: '_id name image linkedin_link'
        } : {
          path: 'member',
          model: 'Member',
          select: '_id companyName website city contactEmail logo country'
        })
        .populate({ path: 'project', model: 'Project' })
        .sort({ dateCreated: 'desc' })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize);
  
      return { ContactsHistory, totalPages, currentPage };
  
    } catch (error) {
      console.error('Error retrieving contact requests:', error);
      throw new Error('Failed to fetch contact requests: ' + error.message);
    }
};  

const getLastRecentContactRequests = async (role, id, status) => {
    try {
        // Construire le filtre de recherche
        const query = {};
        if (role === "member") query.member = id;
        if (role === "investor") query.investor = id;

        if (status && status.length > 0) {
            query.status = { $in: status.split(',') }; 
        }

        const recentRequests = await ContactRequest.find(query)
            .populate(role === "member" ? {
                path: 'investor',
                model: 'Investor',
                select: '_id name image linkedin_link'
            } : {
                path: 'member',
                model: 'Member',
                select: '_id companyName website city contactEmail logo country'
            })
            .populate({ path: 'project', model: 'Project' })
            .sort({ dateCreated: 'desc' })
            .limit(5);

        return { recentRequests };
    } catch (error) {
        throw new Error(`Error fetching recent contact requests: ${error.message}`);
    }
};


const getRecentApprovedContactRequests = async (role, id) => {
    try {
        const query = {};

        // Add filter based on role (member or investor)
        if (role === "member") query.member = id;
        if (role === "investor") query.investor = id;

        // Filter by status 'Approved'
        query.status = 'Approved';

        // Retrieve the most recent 5 approved contact requests
        const recentApprovedContacts = await ContactRequest.find(query)
            .populate(role === "member" ? {
                path: 'investor',
                model: 'Investor',
                select: '_id name image linkedin_link'
            } : {
                path: 'member',
                model: 'Member',
                select: '_id companyName website city contactEmail logo country'
            })
            .populate({ path: 'project', model: 'Project' })
            .sort({ dateCreated: 'desc' })  // Sort by most recent
            .limit(5);  // Limit to 5 results

        return {
            data: recentApprovedContacts,
            message: 'Successfully retrieved the 5 most recent approved contact requests.'
        };
    } catch (error) {
        throw new Error(`Error fetching recent approved contact requests: ${error.message}`);
    }
};


const getDistinctFieldValues = async (role, id, field) => {
    try {
        const query = {};
        if (role === "member") {
            query.member = id;
        } else if (role === "investor") {
            query.investor = id;
        }

        if (field === 'investorNames') {
            const distinctValues = await ContactRequest.aggregate([
                { $match: query }, 
                { $lookup: {
                    from: 'investors', 
                    localField: 'investor',
                    foreignField: '_id', 
                    as: 'investorDetails' 
                }},
                { $unwind: '$investorDetails' }, 
                { $group: {
                    _id: null, 
                    distinctNames: { $addToSet: '$investorDetails.name' } 
                }},
                { $project: {
                    _id: 0, 
                    distinctNames: 1 
                }}
            ]);

            return distinctValues.length > 0 ? distinctValues[0].distinctNames : [];
        }

        const distinctValues = await ContactRequest.distinct(field, query);
        return distinctValues;
    } catch (error) {
        throw new Error('Error retrieving distinct field values: ' + error.message);
    }
};

const getDistinctProjectFieldValues = async (role, id, field, status) => {
    try {
        const query = {};
        if (role === "member") {
            query.member = id;
        } else if (role === "investor") {
            query.investor = id;
        }

        // Ajoutez le filtrage par status si fourni
        if (status) {
            query.status = status;
        }

        // Liste des champs de `Project` que vous souhaitez récupérer
        const projectFields = [
            'sector',
            'funding',
            'name',
            'stage',
            'country',
            'status',
            // Ajoutez d'autres champs de `Project` ici selon vos besoins
        ];

        // Vérifiez si le champ demandé fait partie des champs de `Project`
        if (projectFields.includes(field)) {
            const distinctValues = await ContactRequest.aggregate([
                { $match: query }, 
                { $lookup: {
                    from: 'projects', 
                    localField: 'project',
                    foreignField: '_id', 
                    as: 'projectDetails' 
                }},
                { $unwind: '$projectDetails' }, 
                { $group: {
                    _id: null, 
                    distinctValues: { $addToSet: `$projectDetails.${field}` } 
                }},
                { $project: {
                    _id: 0, 
                    distinctValues: 1 
                }}
            ]);

            return distinctValues.length > 0 ? distinctValues[0].distinctValues : [];
        }

        // Pour les autres champs dans `ContactRequest` directement
        const distinctValues = await ContactRequest.distinct(field, query);
        return distinctValues;
    } catch (error) {
        throw new Error('Error retrieving distinct field values: ' + error.message);
    }
};


async function getAllContactRequestsAll() {
    try {
        const contactRequests = await ContactRequest.find();
        return contactRequests;
    } catch (error) {
        throw new Error('Error getting all contact requests: ' + error.message);
    }
}

const DiffDate = async (req_date) => {
    const currentDate = new Date();
    const reqDate = new Date(req_date);

    const timeDifference = Math.abs(currentDate - reqDate);
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference;

}

async function getContactRequestsForInvestor(investorId) {
    try {
        const contactRequests = await ContactRequest.find({ investor: investorId });
        return contactRequests;
    } catch (error) {
        throw new Error('Error getting contact requests for investor: ' + error.message);
    }
}

async function getContactRequestsForMember(memberId) {
    try {
        const contactRequests = await ContactRequest.find({ member: memberId });
        return contactRequests;
    } catch (error) {
        throw new Error('Error getting contact requests for member: ' + error.message);
    }
}

async function searchContactRequests(user, searchTerm) {
    try {
        const regex = new RegExp(searchTerm, 'i'); 
        let filter = {};

        if (user?.role?.toLowerCase() === 'investor') {
            const investor = await InvestorService.getInvestorByUserId(user?._id);
            filter = { investor: investor._id }; 

            const matchingMembers = await Member.find({ companyName: regex });
            const matchingMemberIds = matchingMembers.map(member => member._id);

            const contactRequests = await ContactRequest.find({
                ...filter,
                member: { $in: matchingMemberIds },  
            }).populate('member');

            return contactRequests;

        } else if (user?.role?.toLowerCase() === 'member') {
            const member = await MemberService.getMemberByUserId(user?._id);
            filter = { member: member._id }; 

            const matchingInvestors = await Investor.find({ name: regex });
            const matchingInvestorIds = matchingInvestors.map(investor => investor._id);

            const contactRequests = await ContactRequest.find({
                ...filter,
                investor: { $in: matchingInvestorIds },
            }).populate('investor');

            return contactRequests;
        }

    } catch (error) {
        throw new Error('Error searching contact requests: ' + error.message);
    }
}

const getContactRequestById = async (id) => {
    return await ContactRequest.findById(id)
        .populate('member')
        .populate('investor')
        .populate('project');
};

const createContactRequest = async (data) => {
    const contactRequest = new ContactRequest(data);
    return await contactRequest.save();
};

const updateContactRequest = async (id, data) => {
    return await ContactRequest.findByIdAndUpdate(id, data, { new: true });
};

const deleteContactRequest = async (id) => {
    return await ContactRequest.findByIdAndDelete(id);
};

const approveContactRequest = async (requestId, approvalData) => {
    const contactRequest = await ContactRequest.findById(requestId);
    if (!contactRequest) {
        throw new Error('Contact request not found');
    }

    const member = await MemberService.getMemberById(contactRequest?.member);
    const investor = await InvestorService.getInvestorById(contactRequest?.investor);
    const project = await ProjectService.getProjectById(contactRequest?.project);

    contactRequest.status = 'Approved';
    contactRequest.approval.approvalDate = new Date();
    contactRequest.approval.approvalNotes = approvalData.approvalNotes;
    contactRequest.approval.typeInvestment = approvalData.typeInvestment;

    await contactRequest.save();

    await ActivityHistoryService.createActivityHistory(
        investor.owner,
        'contact_request_approved',
        { targetName: `${project?.name}`, targetDesc: `Contact request approved by ${investor?.name} for project ${project?.name}` , from: investor?.companyName }
    );

    await NotificationService.createNotification(member?.owner , 'Contact request approved for project' , 'from' , project?._id  , project?.name , investor?.name || investor?.companyName  , investor?.owner)

    return contactRequest;
};

const rejectContactRequest = async (requestId, rejectionData) => {
    const contactRequest = await ContactRequest.findById(requestId);
    if (!contactRequest) {
        throw new Error('Contact request not found');
    }

    const member = await MemberService.getMemberById(contactRequest?.member);
    const investor = await InvestorService.getInvestorById(contactRequest?.investor);
    const project = await ProjectService.getProjectById(contactRequest?.project);

    contactRequest.status = 'Rejected';
    contactRequest.rejection.rejectionDate = new Date();
    contactRequest.rejection.reason = rejectionData.reason;
    contactRequest.rejection.rejectionNotes = rejectionData.rejectionNotes;

    await contactRequest.save();
    await ActivityHistoryService.createActivityHistory(
        investor.owner,
        'contact_request_rejected',
        { targetName: `${project?.name}`, targetDesc: `Contact request rejected by ${investor?.name} for project ${project?.name}` , from: investor?.companyName }
    );

    await NotificationService.createNotification(member?.owner , 'Contact request rejected for project' , 'from' , project?._id  , project?.name , investor?.name || investor?.companyName  , investor?.owner)

    return contactRequest;
};

const countApprovedInvestments = async (role, id) => {
    try {
        // Filtrer les requêtes approuvées
        const query = {
            status: 'Approved'
        };

        // Ajouter le filtre basé sur le rôle
        if (role === "member") {
            query.member = id;

            // Trouver les investisseurs distincts pour les requêtes approuvées pour ce membre
            const distinctInvestors = await ContactRequest.distinct('investor', query);

            return {
                count: distinctInvestors.length,
                message: `Distinct investors for approved requests for member ${id}: ${distinctInvestors.length}`
            };
        } else if (role === "investor") {
            query.investor = id;

            // Compter le nombre total de requêtes approuvées pour l'investisseur
            const approvedInvestmentCount = await ContactRequest.countDocuments(query);

            return {
                count: approvedInvestmentCount,
                message: `Approved investments for investor ${id}: ${approvedInvestmentCount}`
            };
        } else {
            throw new Error("Invalid role provided");
        }
    } catch (error) {
        console.error(`Error counting approved investments: ${error.message}`);
        throw new Error(`Error counting approved investments: ${error.message}`);
    }
};


async function countContactRequestsForInvestor(investorId) {
    try {
        // Count all contact requests for the given investor
        const totalRequests = await ContactRequest.countDocuments({ investor: investorId });

        // Count contact requests for the given investor with status 'In Progress'
        const inProgressRequests = await ContactRequest.countDocuments({
            investor: investorId,
            status: 'In Progress'
        });

        return {
            totalRequests,
            inProgressRequests
        };
    } catch (error) {
        throw new Error('Error counting contact requests for investor: ' + error.message);
    }
}



module.exports = { CreateInvestorContactReq, getAllContactRequest , getContactRequestsForInvestor , 
    getContactRequestsForMember  , shareProjectWithInvestors , CreateInvestorContactReqForProject ,
    getContactRequestById, createContactRequest, updateContactRequest, deleteContactRequest ,
     getAllContactRequestsAll, searchContactRequests , getDistinctFieldValues , getDistinctProjectFieldValues ,
     approveContactRequest , rejectContactRequest , getRecentApprovedContactRequests , countApprovedInvestments , 
     getLastRecentContactRequests , countContactRequestsForInvestor , CreateDraftContactRequest , FinalizeContactRequest
 }
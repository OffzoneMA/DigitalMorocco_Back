const Investor = require("../models/Investor");
const Member = require("../models/Member");
const Project = require("../models/Project");
const ContactRequest = require("../models/ContactRequest");
const InvestorReq = require("../models/Requests/Investor");
const EmailingService = require("../services/EmailingService");
const UserLogService = require('../services/UserLogService');
const ActivityHistoryService = require('../services/ActivityHistoryService');

const getAllInvestors = async (args) => {
    const page = args?.page || 1;
    const pageSize = args?.pageSize || 8;
    const skip = (page - 1) * pageSize;
    const filter = {};

    if (args.type) {
        filter.type = { $in: args.type.split(',') }; 
    }

    if (args.location) {
        filter.location = { $regex: new RegExp(args.location, 'i') }; 
    }

    if (args.industries && args.industries.length > 0) {
        filter.PreferredInvestmentIndustry = { $in: args.industries.split(',') }; 
    }
    const totalCount = await Investor.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / pageSize);
    const investors = await Investor.find(filter)
        // .select("name description image linkedin_link type location PreferredInvestmentIndustry dateCreated numberOfInvestment numberOfExits document")
        .populate({ path: 'owner', select: 'displayName', match: { displayName: { $exists: true } } })
        .skip(skip)
        .sort({ dateCreated: 'desc' })
        .limit(pageSize);
    return { investors, totalPages };
}

// const getAllInvestorsForMember = async (memberId, args) => {
//     const page = args?.page || 1;
//     const pageSize = args?.pageSize || 8;
//     const skip = (page - 1) * pageSize;
    
//     const filter = {};

//     if (args.type) {
//         filter.type = { $in: args.type.split(',') }; 
//     }

//     if (args.location) {
//         filter.location = { $regex: new RegExp(args.location, 'i') }; 
//     }

//     if (args.industries && args.industries.length > 0) {
//         filter.PreferredInvestmentIndustry = { $in: args.industries.split(',') }; 
//     }

//     const totalCount = await Investor.countDocuments(filter);
//     const totalPages = Math.ceil(totalCount / pageSize);
    
//     const investors = await Investor.find(filter)
//         .populate({ path: 'owner', select: 'displayName', match: { displayName: { $exists: true } } })
//         .skip(skip)
//         .sort({ dateCreated: 'desc' })
//         .limit(pageSize)
//         .lean(); // Convert documents to plain JavaScript objects

//     let hasDraftRequest = false;
//     let mostRecentDraftInvestorId = null;
//     let mostRecentDraftDate = null;

//     // Check contact requests for each investor
//     for (const investor of investors) {
//         const [draftContactRequest, acceptedContactRequest] = await Promise.all([
//             ContactRequest.findOne({
//                 investor: investor._id,
//                 member: memberId,
//                 status: 'Draft'
//             }).sort({ dateCreated: 'desc' }), // Most recent draft request
//             ContactRequest.findOne({
//                 investor: investor._id,
//                 member: memberId,
//                 status: { $in: ['Accepted', 'Approved'] }
//             })
//         ]);

//         investor.hasDraftContactRequest = !!draftContactRequest;
//         investor.hasAcceptedContactRequest = !!acceptedContactRequest;

//         if (draftContactRequest) {
//             hasDraftRequest = true;
//             // Check if this draft is the most recent
//             if (!mostRecentDraftDate || draftContactRequest.dateCreated > mostRecentDraftDate) {
//                 mostRecentDraftDate = draftContactRequest.dateCreated;
//                 mostRecentDraftInvestorId = investor._id;
//             }
//         }
//     }

//     return { investors, totalPages, hasDraftRequest, mostRecentDraftInvestorId };
// };

const getAllInvestorsForMember = async (memberId, args) => {
    const requestedPage = parseInt(args?.page, 10) || 1;
    const pageSize = parseInt(args?.pageSize, 10) || 8;
    const skip = (requestedPage - 1) * pageSize;

    const filter = {};

    if (args.type) filter.type = { $in: args.type.split(',') }; 
    if (args.location) filter.location = { $regex: new RegExp(args.location, 'i') };
    if (args.industries) filter.PreferredInvestmentIndustry = { $in: args.industries.split(',') };

    // Compter le nombre total de documents correspondant au filtre
    const totalCount = await Investor.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / pageSize);

    // Si la page demandée dépasse le nombre total de pages, retourner la première page
    const currentPage = requestedPage > totalPages ? 1 : requestedPage;
    const finalSkip = (currentPage - 1) * pageSize;

    // Récupérer les investisseurs correspondant au filtre
    const investors = await Investor.find(filter)
        .populate({ path: 'owner', select: 'displayName', match: { displayName: { $exists: true } } })
        .skip(finalSkip)
        .sort({ dateCreated: 'desc' })
        .limit(pageSize)
        .lean();

    // Regrouper les requêtes de contact
    const contactRequests = await ContactRequest.aggregate([
        {
            $match: {
                investor: { $in: investors.map(inv => inv._id) },
                member: memberId,
                status: { $in: ['Draft', 'Accepted', 'Approved'] }
            }
        },
        { $sort: { dateCreated: -1 } },
        {
            $group: {
                _id: "$investor",
                hasDraftContactRequest: { $max: { $eq: ["$status", "Draft"] } },
                hasAcceptedContactRequest: { $max: { $in: ["$status", ["Accepted", "Approved"]] } },
                mostRecentDraftDate: { $max: { $cond: [{ $eq: ["$status", "Draft"] }, "$dateCreated", null] } }
            }
        }
    ]);

    let hasDraftRequest = false;
    let mostRecentDraftInvestorId = null;
    let mostRecentDraftDate = null;

    // Ajouter les données des requêtes de contact aux investisseurs
    for (const investor of investors) {
        const reqInfo = contactRequests.find(req => req._id.equals(investor._id));
        if (reqInfo) {
            investor.hasDraftContactRequest = reqInfo.hasDraftContactRequest;
            investor.hasAcceptedContactRequest = reqInfo.hasAcceptedContactRequest;
            if (reqInfo.hasDraftContactRequest && (!mostRecentDraftDate || reqInfo.mostRecentDraftDate > mostRecentDraftDate)) {
                hasDraftRequest = true;
                mostRecentDraftDate = reqInfo.mostRecentDraftDate;
                mostRecentDraftInvestorId = investor._id;
            }
        }
    }

    return { 
        investors, 
        totalPages, 
        currentPage, 
        hasDraftRequest, 
        mostRecentDraftInvestorId 
    };
};



const getAllInvestorsWithoutPagination = async (args) => {

    const filter = {};

    if (args.type) {
        filter.type = { $in: args.type.split(',') }; 
    }

    if (args.location) {
        filter.location = { $regex: new RegExp(args.location, 'i') }; 
    }

    if (args.industries && args.industries.length > 0) {
        filter.PreferredInvestmentIndustry = { $in: args.industries }; 
    }

    const investors = await Investor.find(filter)
        // .select("name description image linkedin_link type location PreferredInvestmentIndustry dateCreated numberOfInvestment numberOfExits document")
        .populate({ path: 'owner', select: 'displayName', match: { displayName: { $exists: true } } }).sort({ dateCreated: 'desc' });

    return  investors;
}


const getInvestors = async () => {
    const totalCount = await Investor.countDocuments();
    const investors = await Investor.find()
        .select("name description image linkedin_link type location PreferredInvestmentIndustry dateCreated numberOfInvestment numberOfExits document")
        .populate({ path: 'owner', select: 'displayName', match: { displayName: { $exists: true } } }).sort({ dateCreated: 'desc' }); 

    return { investors, totalCount }
}

const searchInvestors = async (searchTerm) => {
    try {
        const regex = new RegExp(searchTerm, 'i'); 
        
        const investors = await Investor.find({
            $or: [
                { name: regex },       
                { companyName: regex },          
                // { companyType: regex },    
                // { contactEmail: regex },    
                // { desc: regex },       
            ]
        });

        return investors ;
    } catch (error) {
        throw new Error('Error searching investors: ' + error.message);
    }
};


const CreateInvestor = async (investor) => {
    return await Investor.create(investor);
}

const getInvestorById = async (id) => {
    return await Investor.findById(id);
}

const investorByNameExists = async (name) => {
    return await Investor.exists({ name: name })
}

const getInvestorByUserId = async (userId) => {
    return await Investor.findOne({ owner: userId });
}

const deleteInvestor = async (userId) => {
    const investor = await getInvestorByUserId(userId)
    if (investor){
        await ContactRequest.deleteMany({ investor: investor._id })
        await Member.updateMany(
            { $pull: { investorsRequestsAccepted: investor._id }, $pull: { investorsRequestsPending: investor._id } })      
        return await Investor.findByIdAndDelete(investor._id)
    }
    else{
         await InvestorReq.findOneAndDelete({ user: userId })
    }
    return true
}

const getContacts = async (investorId) => {
    const members= await Investor.findById(investorId).select("membersRequestsAccepted").populate({
        path: 'membersRequestsAccepted', select: '_id  country companyType owner logo companyName contactEmail city website'
    });
    return members.membersRequestsAccepted
}

const getProjects = async () => {

    const projects = await Project.find({ visbility: 'public' })
                        .populate({
                            path: 'owner',
                            select: '_id country companyType owner logo companyName contactEmail city website', // Select the fields you want from the member (enterprise)
                        })
                        .select('_id name funding currency details milestoneProgress documents');
    return projects;
}

const updateContactStatus=async(requestId , response)=>{
        const request = await ContactRequest.findById(requestId)
        if (!request) {
            throw new Error('Request doesn t exist')
        }
        if (response === "accepted") return await acceptContact(request?.investor,requestId, request.member);
        if (response === "rejected") return await rejectContact(request?.investor, requestId, request.member);
}

const acceptContact = async (investorId, requestId, memberId) => {
   const request = await ContactRequest.findByIdAndUpdate(requestId, { status:"Accepted" })
   const project = await Project.findById(request?.project)
   const member = await Member.findByIdAndUpdate(memberId, {
        $push: { investorsRequestsAccepted:  investorId  },
        $pull: { investorsRequestsPending: investorId },
    })
    const investor = await Investor.findByIdAndUpdate(investorId, {
        $push: { membersRequestsAccepted: memberId },
        $pull: { membersRequestsPending: memberId },
    })
    
        const logMessage ='Contact request with ID '+request._id+' is accepted';
            
    const log = await UserLogService.createUserLog(logMessage, investor.owner);
    const logMember = await UserLogService.createUserLog(logMessage, member.owner);
    const mail = await EmailingService.sendContactAcceptToMember(member.owner, investor?.name, investor?.linkedin_link, request.dateCreated);
    await ActivityHistoryService.createActivityHistory(
        investor.owner,
        'contact_request_accepted',
        { targetName: `${project?.name}`, targetDesc: `Contact request accepted by investor ${investorId}` , from: member?.companyName }
    );
    return request
}

const rejectContact= async (investorId, requestId, memberId) => {

     const request = await ContactRequest.findByIdAndUpdate(requestId, { status:"rejected"})
     const project = await Project.findById(request?.project)
    const member = await Member.findByIdAndUpdate(memberId, {
       $push: { investorsRequestsRejected: investorId },
        $pull: { investorsRequestsPending: investorId },
    })
     const investor = await Investor.findByIdAndUpdate(investorId, {
        $push: { membersRequestsRejected: memberId },
        $pull: { membersRequestsPending: memberId },
    })
     const logMessage = 'Contact request with ID '+request._id+' is rejected';
     const log = await UserLogService.createUserLog(logMessage, investor.owner);
     const logMember = await UserLogService.createUserLog(logMessage, member.owner);

     const mail = await EmailingService.sendContactRejectToMember(member.owner, investor?.name, investor?.linkedin_link, request.dateCreated);
     await ActivityHistoryService.createActivityHistory(
        investor.owner,
        'contact_request_rejected',
        { targetName: `${project?.name}`, targetDesc: `Contact request rejected by investor ${investorId}` , from: member?.campanyName}
    );
    return request
}
const updateInvestor = async (id, data) => {
    return await Investor.findByIdAndUpdate(id, data, { new: true });
};

const getDistinctValues = async (field) => {
    try {
        if (field === 'PreferredInvestmentIndustry') {
            const distinctValues = await Investor.aggregate([
                { $match: { PreferredInvestmentIndustry: { $ne: null } } },
                { $unwind: '$PreferredInvestmentIndustry' }, 
                { $group: { _id: '$PreferredInvestmentIndustry' } }, 
                { $project: { _id: 0, value: '$_id' } } 
            ]);
            return distinctValues.map(item => item.value); 
        }

        const distinctValues = await Investor.distinct(field, { [field]: { $ne: null } });
        return distinctValues;

    } catch (error) {
        throw new Error(`Error fetching distinct ${field}: ${error.message}`);
    }
};

async function getInvestorDetailsRequest(memberId, investorId) {
    try {
        // Find the member
        const member = await Member.findById(memberId).populate("investorsRequestsAccepted");
        if (!member) {
            throw new Error("Member not found");
        }

        // Check if the investor has accepted the request
        const acceptedInvestor = member.investorsRequestsAccepted.find(inv => inv?._id.toString() === investorId);

        // Check if the investor has any accepted or approved requests with this member
        const existingRequests = await ContactRequest.find({
            member: memberId,
            investor: investorId,
            status: { $in: ['Approved', 'Accepted'] }
        });

        const hasApprovedRequests = existingRequests.length > 0;

        // Check if there's a draft contact request for this investor
        const draftRequest = await ContactRequest.findOne({
            member: memberId,
            investor: investorId,
            status: 'Draft'
        });

        const hasDraftContactRequest = !!draftRequest; // true if a draft request exists
        const draftRequestId = draftRequest?._id || null; // Get the draft request ID if it exists

        if (acceptedInvestor || hasApprovedRequests) {
            // If the investor has accepted or approved at least one request, retrieve full details
            const investorDetails = await Investor.findById(investorId);

            return {
                status: "accepted",
                details: investorDetails,
                hasDraftContactRequest,
                draftRequestId
            };
        } else {
            // Investor hasn't accepted/approved; provide restricted (fake) data
            const investor = await Investor.findById(investorId);

            const fakeData = {
                ...investor?._doc, // copy all original fields
                image: "fake_image_url.jpg",
                name: "Digital Morocco Partner",
                companyName: "Digital Morocco Partner",
                legalName: "Digital Morocco Partner",
                phoneNumber: "+212 6 00 00 00 00",
                type: "Digital Morocco Partner",
                website: "https://digitalmorocco.net/",
                emailAddress: "info@digitalmorocco.net",
                desc: "Oups ! Vous pensiez vraiment avoir trouvé la porte secrète ?! 😆 \n🚫 Pas si vite, pirate ! 🏴‍☠️ Le capitaine doit d’abord donner son feu vert avant de lever le voile. ⛵ En attendant, savourez ce suspense… C’est presque aussi captivant qu’une chasse au trésor ! 🗝️🗺️😉",
            };

            return {
                status: "pending",
                details: fakeData,
                hasDraftContactRequest,
                draftRequestId
            };
        }
    } catch (error) {
        console.error(error);
        throw new Error("An error occurred while checking the investor request");
    }
}

const deleteInvestorById = async (investorId) => {
    try {
        const investor = await Investor.findByIdAndDelete(investorId);
        if (!investor) {
            throw new Error('Investor not found');
        }
        return investor;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = { deleteInvestor,getContacts, getProjects, CreateInvestor, 
    getInvestorById, investorByNameExists, getAllInvestors, getInvestorByUserId, 
    updateContactStatus , updateInvestor , getInvestors  , getDistinctValues , 
    getInvestorDetailsRequest , searchInvestors , getAllInvestorsWithoutPagination , 
    deleteInvestorById , getAllInvestorsForMember 
}

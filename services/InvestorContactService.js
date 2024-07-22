const EmailingService = require("./EmailingService");
const Investor = require("../models/Investor");
const Member = require("../models/Member");
const ContactRequest = require("../models/ContactRequest");
const MemberService = require("./MemberService");
const InvestorService = require("./InvestorService");
const UserService = require("./UserService");
const ProjectService = require("./ProjectService");
const ActivityHistoryService = require('../services/ActivityHistoryService');
const uploadService = require('./FileService')

const User = require("../models/User");

const CreateInvestorContactReq = async (memberId, investorId) => {
    const cost = process.env.credits || 3
    const delay = process.env.Contact_Delay_After_Reject_by_days || 180
    const member = await MemberService.getMemberById(memberId)
    const investor = await InvestorService.getInvestorById(investorId)

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

    if (member?.subStatus == "notActive") {
        throw new Error('Must Subscribe !')
    }
    if (member?.credits < cost) {
        throw new Error('Not Enough Credits!')
    }
    const contact = await ContactRequest.create({ member: memberId, investor: investorId, cost: cost })


    const updateMember = {
        $push: { investorsRequestsPending: investorId },
        $inc: { credits: -cost },
    };
    const updateInvestor = {
        $push: { membersRequestsPending: memberId },
    };

    const updatedInvestor = await Investor.findByIdAndUpdate(investorId, updateInvestor)
    const updatedMember = await Member.findByIdAndUpdate(memberId, updateMember)

    const historyData = {
        member: updatedMember._id,
        eventType: 'contact_request_sent',
        eventDetails: 'Send Contact Request to',
        timestamp: new Date(),
        user: updatedMember.owner,
        actionTargetType: 'Subscribe',
        targetUser: {
            usertype: 'Investor',
            userId: updatedInvestor._id
        }    
    };

    await ActivityHistoryService.createActivityHistory(historyData);

    //Send Email Notification to the investor
    await EmailingService.sendNewContactRequestEmail(investor.owner, member?.companyName, member?.country);


    return contact
}

const CreateInvestorContactReqForProject = async (memberId, investorId , projectId , document , data) => {
    const cost = process.env.credits || 3
    const delay = process.env.Contact_Delay_After_Reject_by_days || 180
    const member = await MemberService.getMemberById(memberId)
    const investor = await InvestorService.getInvestorById(investorId)
    const project = await ProjectService.getProjectById(projectId) 

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

    if (member?.subStatus == "notActive") {
        throw new Error('Must Subscribe !')
    }
    if (member?.credits < cost) {
        throw new Error('Not Enough Credits!')
    }

    let docLink = null;

    if (document) {
        docLink = await uploadService.uploadFile(document, `Members/${member.owner}/Project_documents`, document.originalname);
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
        $push: { investorsRequestsPending: investorId },
        $inc: { credits: -cost },
    };

    const updateInvestor = {
        $push: { membersRequestsPending: memberId },
    };

    const updatedInvestor = await Investor.findByIdAndUpdate(investorId, updateInvestor)
    const updatedMember = await Member.findByIdAndUpdate(memberId, updateMember)

    const historyData = {
        member: updatedMember._id,
        eventType: 'contact_request_sent',
        eventDetails: 'Send Contact Request to',
        timestamp: new Date(),
        user: updatedMember.owner,
        actionTargetType: 'Project',
        actionTarget: projectId,
        targetUser: {
            usertype: 'Investor',
            userId: updatedInvestor._id
        }    
    };

    await ActivityHistoryService.createActivityHistory(historyData);

    //Send Email Notification to the investor
    await EmailingService.sendNewContactRequestEmail(investor.owner, member?.companyName, member?.country);


    return contact
}

const shareProjectWithInvestors = async (projectId, memberId, investorIds) => {
    const project = await ProjectService.getProjectById(projectId);
    if (!project) {
        throw new Error("Project doesn't exist");
    }

    const member = await MemberService.getMemberById(memberId);
    if (!member) {
        throw new Error("Member doesn't exist");
    }

    const cost = process.env.Share_Project_Cost || 100;
    const delay = process.env.Contact_Delay_After_Reject_by_days || 180;

    if (member.subStatus === "notActive") {
        throw new Error('Must Subscribe!');
    }

    if (member.credits < cost * investorIds.length) {
        throw new Error('Not Enough Credits!');
    }

    const results = [];

    for (const investorId of investorIds) {
        const investor = await InvestorService.getInvestorById(investorId);
        if (!investor) {
            results.push({ investorId, status: "Investor doesn't exist" });
            continue;
        }

        const existingRequest = await ContactRequest.findOne({ member: memberId, investor: investorId, status: { $in: ["pending", "accepted"]} , project: projectId });
        if (existingRequest) {
            results.push({ investorId, status: 'Request already exists' });
            continue;
        }

        const latestRejectedRequest = await ContactRequest.findOne({ member: memberId, investor: investorId, status: 'rejected' , project: projectId }).sort({ dateCreated: -1 });
        if (latestRejectedRequest) {
            const daysDiff = (new Date() - latestRejectedRequest.dateCreated) / (1000 * 60 * 60 * 24);
            if (daysDiff < delay) {
                results.push({ investorId, status: `Can't make a contact request, ${Math.ceil(delay - daysDiff)} day(s) remaining` });
                continue;
            }
        }

        const contact = await ContactRequest.create({ member: memberId, investor: investorId, cost , project: projectId});
        await Member.findByIdAndUpdate(memberId, { $push: { investorsRequestsPending: investorId }, $inc: { credits: -cost } });
        await Investor.findByIdAndUpdate(investorId, { $push: { membersRequestsPending: memberId } });

        const historyData = {
            member: memberId,
            eventType: 'contact_request_sent',
            eventDetails: 'Send Contact Request to',
            timestamp: new Date(),
            user: member.owner,
            actionTargetType: 'Project',
            actionTarget: projectId,
            targetUser: {
                usertype: 'Investor',
                userId: investor?.owner
            }
        };

        await ActivityHistoryService.createActivityHistory(historyData);
        await EmailingService.sendNewProjectShareRequestEmail(investor.owner, member.companyName, member.country, project);

        results.push({ investorId, status: 'Request sent successfully' });
    }

    return results;
};

const getAllContactRequest = async (args, role, id) => {
    const page = args.page || 1;
    const pageSize = args.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const query = {};
    if (role == "member") query.member = id;
    if (role == "investor") query.investor = id;
    if (args?.status) query.status = args?.status;


    const totalCount = await ContactRequest.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize);
    const ContactsHistory = await ContactRequest.find(query)
        .populate(role == "member" ? { path: 'investor' , model: 'Investor', select: '_id name image linkedin_link' } : { path: 'member' , model: 'Member', select: '_id companyName website city contactEmail logo country' })
        .select('status communicationStatus')
        .sort({ dateCreated: 'desc' })
        .skip(skip)
        .limit(pageSize);
    return { ContactsHistory, totalPages }


}

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

const getContactRequestById = async (id) => {
    return await ContactRequest.findById(id)
        .populate('member', '_id companyName website city contactEmail logo country')
        .populate('investor', 'name linkedin_link');
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


module.exports = { CreateInvestorContactReq, getAllContactRequest ,
    getContactRequestsForInvestor , getContactRequestsForMember  , 
    shareProjectWithInvestors , CreateInvestorContactReqForProject ,
    getContactRequestById, createContactRequest, updateContactRequest, deleteContactRequest , getAllContactRequestsAll
 }
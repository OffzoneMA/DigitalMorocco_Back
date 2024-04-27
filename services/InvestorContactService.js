const EmailingService = require("./EmailingService");
const Investor = require("../models/Investor");
const Member = require("../models/Member");
const ContactRequest = require("../models/ContactRequest");
const MemberService = require("./MemberService");
const InvestorService = require("./InvestorService");
const UserService = require("./UserService");
const ActivityHistoryService = require('../services/ActivityHistoryService');

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
    const ContactsHistory = await ContactRequest.find(query).sort({ dateCreated: 'desc' })
        .populate(role == "member" ? { path: 'investor', select: 'name linkedin_link' } : { path: 'member', select: '_id companyName website city contactEmail logo country' })
        .skip(skip)
        .limit(pageSize);
    return { ContactsHistory, totalPages }


}

async function getAllContactRequests() {
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


module.exports = { CreateInvestorContactReq, getAllContactRequest ,getAllContactRequest,
    getContactRequestsForInvestor , getContactRequestsForMember , getAllContactRequest
 }
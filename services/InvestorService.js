const Investor = require("../models/Investor");
const Member = require("../models/Member");
const ContactRequest = require("../models/ContactRequest");
const MemberService = require("../services/MemberService");
const InvestorService = require("../services/InvestorService");


const getAllInvestors = async (args) => {
    const page = args.page || 1;
    const pageSize = args.pageSize || 10;
    const skip = (page - 1) * pageSize;

    // const countries = args.countries ? args.countries.split(',') : [];
    // const sectors = args.sectors ? args.sectors.split(',') : [];
    // const stages = args.stages ? args.stages.split(',') : [];

    // const query = {};
    // query.companyName = { $exists: true }
    // query.visbility = 'public'
    // if (countries.length > 0) query.country = { $in: countries };
    // if (sectors.length > 0) query.sector = { $in: sectors };
    // if (stages.length > 0) query.stage = { $in: stages };

    const totalCount = await Investor.countDocuments();
    const totalPages = Math.ceil(totalCount / pageSize);
    const investors = await Investor.find()
        .populate({ path: 'owner', select: 'displayName', match: { displayName: { $exists: true } }, })
        .skip(skip)
        .limit(pageSize);
    return { investors, totalPages }


}


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

const updateContactStatus=async(investorId,requestId,response)=>{

    const investor = await getInvestorById(investorId)
    const request = await ContactRequest.find(requestId)
    if (!request) {
        throw new Error('Request doesn t exist')
    }
    if (response == "accepted") return await acceptContact(investorId, requestId, request.member)
    if (response == "rejected") return await rejectContact(investorId, requestId, request.member)
    else{
        throw new Error('Something went wrong !')
      }
    /*  const memberId = 'your_member_id'; // Replace with the actual member ID
    const requestId = 'your_request_id'; // Replace with the ID of the request you want to update
    const newStatus = 'accepted'; // Replace with the new status

    // Define the update object to set the status of the specific request
    const update = {
        $set: { 'InvestorsRequests.$[elem].status': newStatus },
    };

    // Define the array filter to identify the request by its _id
    const arrayFilters = [{ 'elem._id': requestId }];

    // Use findOneAndUpdate to update the Member document
    Member.findOneAndUpdate(
        { _id: memberId },
        update,
        { new: true, arrayFilters: arrayFilters })*/
}

const acceptContact = async (investorId, requestId, memberId) => {
    const request = await ContactRequest.findByIdAndUpdate(requestId, { status: "accepted" })
    const member = await Member.findByIdAndUpdate(memberId, {
        $push: { investorsRequestsAccepted:  investorId  },
        $pull: { investorsRequestsPending: investorId },
    })
    const investor = await Investor.findByIdAndUpdate(investorId, {
        $push: { membersRequestsAccepted: memberId },
        $pull: { membersRequestsPending: memberId },
    })
    return request


}


const rejectContact= async (investorId, requestId, memberId) => {

    const request = await ContactRequest.findByIdAndUpdate(requestId, { status:"rejected"})
    const member = await Member.findByIdAndUpdate(memberId, {
       // $push: { investorsRequestsRejected: investorId },
        $pull: { investorsRequestsPending: investorId },
    })
     const investor = await Investor.findByIdAndUpdate(investorId, {
        //$push: { membersRequestsRejected: memberId },
        $pull: { membersRequestsPending: memberId },
    })
    return request
}


module.exports = { CreateInvestor, getInvestorById, investorByNameExists, getAllInvestors, getInvestorByUserId, updateContactStatus }
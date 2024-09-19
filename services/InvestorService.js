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
    const pageSize = args?.pageSize || 10;
    const skip = (page - 1) * pageSize;
    const totalCount = await Investor.countDocuments();
    const totalPages = Math.ceil(totalCount / pageSize);
    const investors = await Investor.find()
        // .select("name description image linkedin_link type location PreferredInvestmentIndustry dateCreated numberOfInvestment numberOfExits document")
        .populate({ path: 'owner', select: 'displayName', match: { displayName: { $exists: true } } })
        .skip(skip)
        .limit(pageSize);
    return { investors, totalPages }
}

const getInvestors = async () => {
    const totalCount = await Investor.countDocuments();
    const investors = await Investor.find()
        .select("name description image linkedin_link type location PreferredInvestmentIndustry dateCreated numberOfInvestment numberOfExits document")
        .populate({ path: 'owner', select: 'displayName', match: { displayName: { $exists: true } } }); 

    return { investors, totalCount }
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
        if (response == "accepted") return await acceptContact(request?.investor,requestId, request.member);
        if (response == "rejected") return await rejectContact(request?.investor, requestId, request.member);
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
        const distinctValues = await Investor.distinct(field);
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

        if (acceptedInvestor) {
            // If the investor has accepted, retrieve full details
            const investorDetails = await Investor.findById(investorId);

            return {
                status: "accepted",
                details: investorDetails,
            };
        } else {
            const investor = await Investor.findById(investorId);

            const fakeData = {
                ...investor._doc, // copy all original fields
                image: "fake_image_url.jpg",
                name: "The Investor Name",
                legalName: "Fake Company Legal Name",
                phone: "000-000-0000",
                type: "Unknown",
                website: "https://fakewebsite.com",
                email: "fake@example.com",
                desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
            };


            return {
                status: "pending",
                details: fakeData,
            };
        }
    } catch (error) {
        console.error(error);
        throw new Error("An error occurred while checking the investor request");
    }
}

module.exports = { deleteInvestor,getContacts, getProjects, CreateInvestor, 
    getInvestorById, investorByNameExists, getAllInvestors, getInvestorByUserId, 
    updateContactStatus , updateInvestor , getInvestors  , getDistinctValues , getInvestorDetailsRequest}
const Investor = require("../models/Investor");
const Member = require("../models/Member");
const Project = require("../models/Project");
const ContactRequest = require("../models/ContactRequest");
const InvestorReq = require("../models/Requests/Investor");
const EmailingService = require("../services/EmailingService");
const UserLogService = require('../services/UserLogService');




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
    const investors = await Investor.find().select("_id owner linkedin_link")
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

const updateContactStatus=async(investorId,requestId,response)=>{
        const request = await ContactRequest.findById(requestId)
        console.log('Response received:', response);
        if (!request) {
            throw new Error('Request doesn t exist')
        }
        if (response == "accepted") return await acceptContact(investorId, requestId, request.member);
        if (response == "rejected") return await rejectContact(investorId, requestId, request.member);

    }



const acceptContact = async (investorId, requestId, memberId) => {
   const request = await ContactRequest.findByIdAndUpdate(requestId, { status:"accepted" })
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
     const logMessage = 'Contact request with ID '+request._id+' is rejected';
     const log = await UserLogService.createUserLog(logMessage, investor.owner);
     const logMember = await UserLogService.createUserLog(logMessage, member.owner);

     const mail = await EmailingService.sendContactRejectToMember(member.owner, investor?.name, investor?.linkedin_link, request.dateCreated);
    return request
}


  
 
module.exports = { deleteInvestor,getContacts, getProjects, CreateInvestor, getInvestorById, investorByNameExists, getAllInvestors, getInvestorByUserId, updateContactStatus}
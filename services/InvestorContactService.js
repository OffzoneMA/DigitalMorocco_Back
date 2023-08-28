const Investor = require("../models/Investor");
const Member = require("../models/Member");
const ContactRequest = require("../models/ContactRequest");
const MemberService = require("./MemberService");
const InvestorService = require("./InvestorService");
const EmailingService = require("./EmailingService");

const User = require("../models/User");



const CreateInvestorContactReq = async (memberId, investorId) => {
        const cost = 3
        const member = await MemberService.getMemberById(memberId)
        const investor = await InvestorService.getInvestorById(investorId)
        if (!member || !investor) {
            throw new Error("member Or Investor doen't exist")
        }
        const request = await ContactRequest.find({ $and: [{ status: {$in:["pending","accepted"]} }, { member: memberId }, { investor: investorId }]  })
        if(request){
            if (request.status == "pending")  throw new Error('Request is already initialized!')
            if (request.status == "accepted")  throw new Error('Request is already Accepted!')
        }
        if (member?.subStatus =="notActive") {
            throw new Error('Must Subscribe !')
        }
        if (member?.credits < cost) {
            throw new Error('Not Enough Credits!')
        }
        const contactrequest = await ContactRequest.create({ member: memberId, investor: investorId, cost :cost})

       
        const updateMember = {
            $push: { investorsRequestsPending:  investorId  },
            $inc: { credits: -cost },
        };
       const updateInvestor = {
           $push: { membersRequestsPending:  memberId  },
        }; 

       const updatedInvestor = await Investor.findByIdAndUpdate(investorId, updateInvestor)
       const updatedMemeber = await Member.findByIdAndUpdate(memberId, updateMember)

       //Send Email Notification to the investor
       const mail = await EmailingService.sendNewContactRequestEmail(investor.owner,member?.companyName,member?.country);

       return ("contactrequest")
}

const getAllContactRequest = async (args,role,id) => {
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
        .populate(role == "member" ? { path: 'investor', select: 'name linkedin_link' } : { path: 'member', select: '_id companyName logo country' } )
        .skip(skip)
        .limit(pageSize);
    return { ContactsHistory, totalPages }


}




module.exports = { CreateInvestorContactReq, getAllContactRequest }
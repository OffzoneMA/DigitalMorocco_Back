const mongoose = require("mongoose");

const InvestorSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    },
    name:  String,
    legalName:String,
    companyType: String,
    description: String,
    foundedDate: String,
    headquarter: String,
    investmentStage: String,
    lastFundingType: String,
    phoneNumber : String,
    emailAddress: String,
    investmentCapacity: Number,
    image: String,
    investorType: String,
    website: String,
    fund: Number,
    fundingRound : String,
    acquisitions : Number,
    linkedin_link: String,
    document: [{
        name: String,
        link: String,
    }],
    numberofInvestment : Number,
    numberofExits :Number,
    location :String,
    investments: [
        {
            announcementDate : Date,
            companyName : String,
            companyLogo : String,
            location : String,
            fundingRound : String,
            moneyRaised : Number,
        }
    ],
    //Members Requests
    membersRequestsAccepted: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Member"
        }
    ],
    membersRequestsPending: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Member"
        }
    ],
    /*membersRequestsRejected: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Member"
        }
    ],*/



    dateCreated: { type: Date, default: Date.now },

})


const Investor = mongoose.model("Investor", InvestorSchema)
module.exports = Investor
const mongoose = require("mongoose");

const InvestorSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    },
    name:  String,
    companyName: String,
    legalName:String,
    website: String,
    contactEmail: String,
    desc:String,
    address: String,
    country: String,
    city: String,
    taxNbr: String,
    corporateNbr: String,
    companyType: String,
    foundedDate: String,
    headquarter: String,
    investmentStage: String,
    lastFundingType: String,
    phoneNumber : String,
    emailAddress: String,
    investmentCapacity: Number,
    image: String,
    investorType: String,
    fund: Number,
    fundingRound : String,
    acquisitions : Number,
    linkedin_link: String,
    type: String,
    location: String,
    PreferredInvestmentIndustry: String,
    dateCreated: { type: Date, default: Date.now },
    numberOfInvestment: { type : Number, default:0},
    numberOfExits: { type : Number, default:0},
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

})


const Investor = mongoose.model("Investor", InvestorSchema)
module.exports = Investor
const { Binary } = require("mongodb");
const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    },
    //Entrepise Infos
    companyName: String,
    legalName: String,
    website: String,
    contactEmail: String,
    desc:String,
    address: String,
    country: String,
    city: String,
    // state: String,
    companyType: String,
    taxNbr: String,
    corporateNbr: String,
    logo: String,
    stage: { type: String },
    visbility: {
        type: String,
        enum: ['public', 'private'],
    },
    rc_ice: String,
    dateCreated: { type: Date, default: Date.now },

    // associatedUsers: [{
    //     type: mongoose.Types.ObjectId,
    //     ref: "User"
    // }],

    //Investors
    investorsRequestsAccepted: [
           { type: mongoose.Types.ObjectId,
            ref: "Investor" }
    ],
    investorsRequestsPending: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Investor"
        }
    ],
    /*investorsRequestsRejected: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Investor"
        }
    ],*/


    //Current subscription infos
    
})

MemberSchema.index({ owner: 1 });

const Member = mongoose.model("Member", MemberSchema)
module.exports = Member
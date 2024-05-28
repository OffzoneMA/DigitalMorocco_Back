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
    listEmployee: [{
        fullName: { type: String },
        email: { type: String },
        jobTitle: { type: String },
        level: { type: String },
        status: {
            type: String,
            enum: ['active', 'offline'],
            default: 'offline'
        },
        address: { type: String },
        country: { type: String },
        cityState: { type: String },
        phoneNumber: { type: String },
        startDate: { type: Date },
        personalTaxIdentifierNumber: { type: String },
        photo: { type: Buffer },
        department: { type: String },
    }],
    legalDocument: [{
        name: {type:String},
        description: String,
        cityState: {type: String},
        date: { type: Date, default: Date.now },
        type: {type:String},
        lastModifiedDate: { type: Date},
        title: { type: String},
        data: { type:String},
    }],
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
    subscriptionId: {
        type: mongoose.Types.ObjectId,
        ref: "Subscription",
    },
    credits:{
        type:Number,
        default:0
    },
    subStatus:
    {
        type: String,
        enum: ['notActive', 'active'],
        default: 'notActive'
    },
    expireDate:Date,
})


const Member = mongoose.model("Member", MemberSchema)
module.exports = Member
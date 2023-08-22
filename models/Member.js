const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    },
    
    companyName: String,
    legalName: String,
    website: String,
    contactEmail: String,
    address: String,
    country: String,
    city: String,
    state: String,
    companyType: String,
    taxNbr: String,
    corporateNbr: String,
    logo: String,
    listEmployee: [{
        firstName: { type: String },
        lastName: { type: String },
    }],
    legalDocument: [{
        name: {type:String},
        link: {type:String},
        date: { type: Date, default: Date.now },
        type: {type:String},
    }],

    rc_ice: String,
    dateCreated: { type: Date, default: Date.now },

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
    visbility: {
        type: String,
        enum: ['public', 'private'],
    },
})


const Member = mongoose.model("Member", MemberSchema)
module.exports = Member
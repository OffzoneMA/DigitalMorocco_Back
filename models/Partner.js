const mongoose = require("mongoose");

const PartnerSchema = new mongoose.Schema({
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
    desc: String,
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
        name: { type: String },
        link: { type: String },
        date: { type: Date, default: Date.now },
        type: { type: String },
    }],
    visbility: {
        type: String,
        enum: ['public', 'private'],
    },
   /* subscription: [{
        type: mongoose.Types.ObjectId,
        ref: "Subscription"
    }],*/
    num_rc: String,

    dateCreated: { type: Date, default: Date.now },

})


const Partner = mongoose.model("Partner", PartnerSchema)
module.exports = Partner
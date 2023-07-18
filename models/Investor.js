const mongoose = require("mongoose");

const InvestorSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    },
    name: {
        type: String,
        unique: true,
        required: true
    },
    description: String,
    image: String,
    linkedin_link: String,
    invested_startups: {
        type: mongoose.Types.ObjectId,
        ref: "Member"
    },
    document: [{
        name: String,
        link: String,
    }],
    dateCreated: { type: Date, default: Date.now },

})


const Investor = mongoose.model("Investor", InvestorSchema)
module.exports = Investor
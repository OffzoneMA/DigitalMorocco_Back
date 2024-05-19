const mongoose = require("mongoose");

const InvestorRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    linkedin_link: String,
    dateCreated: { type: Date, default: Date.now },
})


const InvestorRequest = mongoose.model("Investor_Request", InvestorRequestSchema)
module.exports = InvestorRequest
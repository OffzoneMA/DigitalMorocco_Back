const mongoose = require("mongoose");

const InvestorRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    linkedin_link: String,
    dateCreated: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['Approved','Rejected', 'In Progress'],
        default: 'In Progress'
    },
    communicationStatus: String,
    note: String,
    attachment: String,
})


const InvestorRequest = mongoose.model("Investor_Request", InvestorRequestSchema)
module.exports = InvestorRequest
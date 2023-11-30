const mongoose = require("mongoose");

const InvestorSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    },
    name:  String,
    description: String,
    image: String,
    linkedin_link: String,
    document: [{
        name: String,
        link: String,
    }],

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
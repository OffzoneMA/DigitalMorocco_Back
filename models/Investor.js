const mongoose = require("mongoose");

const InvestorSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    },

    invested_startups: {
        type: mongoose.Types.ObjectId,
        ref: "Member"
        
    },

    name: {
        type: String,
        unique: true,
        required: true
    },

    description: String,
    image: String,
    document: [{
        name: String,
        link: String,
    }]

})


const Investor = mongoose.model("Investor", InvestorSchema)
module.exports = Investor
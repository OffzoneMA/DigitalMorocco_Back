const mongoose = require("mongoose");

const PartnerRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    num_rc: String,
    dateCreated: { type: Date, default: Date.now },
})


const PartnerRequest = mongoose.model("Partner_Request", PartnerRequestSchema)
module.exports = PartnerRequest
const mongoose = require("mongoose");

const MemberRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    rc: String,
    ice: String,
    dateCreated: { type: Date, default: Date.now },
})


const MemberRequest = mongoose.model("Member_Request", MemberRequestSchema)
module.exports = MemberRequest
const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
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
    rc: String,
    ice: String,
    document: [{
        name: String,
        link: String,
    }],
    dateCreated: { type: Date, default: Date.now },

})


const Member = mongoose.model("Member", MemberSchema)
module.exports = Member
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
    document: [{
        name: String,
        link: String,
    }]

})


const Member = mongoose.model("Member", MemberSchema)
module.exports = Member
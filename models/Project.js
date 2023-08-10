const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "Member",
        unique: true,
        required: true
    },
    name: String,
    funding: Number,
    currency: {
        type: String,
        enum: ['MAD','€','$'],
    },
    listMembers: [{
        firstName: String,
        lastName: String,
        role: String,
    }],
    details: String,
    milestoneProgress: String,
    documents: [{
        name: String,
        link: String,
    }],
    dateCreated: { type: Date, default: Date.now },
})


const Project = mongoose.model("Project", ProjectSchema)
module.exports = Project
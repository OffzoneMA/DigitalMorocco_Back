const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "Member",
        //unique: true,
        required: true
    },
    name: String,
    funding: Number,
    currency: {
        type: String,
        enum: ['MAD','€','$'],
    },
    listMember: [{
        firstName: { type: String },
        lastName: { type: String },
        role: { type: String },
        image: String
    }],
    details: String,
    milestones: [
        {
          name: { type: String },
          description: { type: String },
          dueDate: { type: Date },
          completed: { type: Boolean, default: false }
        }
    ],
    //milestoneProgress: String,
    documents: [{
        name: { type: String },
        link: { type: String },
        date: { type: Date, default: Date.now },
        type: { type: String },
    }],
    visbility:{
        type: String,
        enum: ['public', 'private'],
        default:'public'
    },
    dateCreated: { type: Date, default: Date.now },
    status: String,
    stage: String
})


const Project = mongoose.model("Project", ProjectSchema)
module.exports = Project
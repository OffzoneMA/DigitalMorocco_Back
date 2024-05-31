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
    totalRaised: Number,
    currency: {
        type: String,
        enum: ['MAD','€','$', "USD"],
        default: "USD"
    },
    listMember: [{
        employee: {
            type: mongoose.Schema.Types.ObjectId,
        },
        fullName: { type: String },
        personalEmail: { type: String },
        workEmail: { type: String },
        jobTitle: { type: String },
        status: {
            type: String,
        },
        image: {type : String} ,
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
    documents: [{
        name: { type: String },
        link: { type: String },
        date: { type: Date, default: Date.now },
        type: { type: String },
        documentType: String,
    }],
    visbility:{
        type: String,
        enum: ['public', 'private'],
        default:'public'
    },
    dateCreated: { type: Date, default: Date.now },
    status: {
        type: String,
        enum:["In Progress", "Active" , "Stand by"],
        default :"In Progress"
    },
    stages: [String]
})


const Project = mongoose.model("Project", ProjectSchema)
module.exports = Project
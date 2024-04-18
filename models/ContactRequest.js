const mongoose = require("mongoose");

const ContactRequestSchema = new mongoose.Schema({
    member: {
        type: mongoose.Types.ObjectId,
        ref: "Member",
    },
    investor: {
        type: mongoose.Types.ObjectId,
        ref: "Investor",
    },
    project : {
        type: mongoose.Types.ObjectId,
        ref: "Project",
    },
    cost:Number,
    requestLetter: String,
    document: {},
    date: String,
    communicationStatus: String,
    notes: String,
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected' ,'In Progress'],
        default: 'pending'
    },

    dateCreated: { type: Date, default: Date.now },

})


const ContactRequest = mongoose.model("ContactRequest", ContactRequestSchema)
module.exports = ContactRequest
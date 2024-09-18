const mongoose = require("mongoose");

const ContactRequestSchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
    },
    investor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Investor",
    },
    project : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
    },
    cost:Number,
    requestLetter: String,
    document: {
        name: String,
        link: String,
        mimeType: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
    communicationStatus: String,
    attachment: String,
    notes: String,
    status: {
        type: String,
        enum: ['Pending', 'Approved' , 'Accepted', 'Rejected' ,'In Progress'],
        default: 'Pending'
    },

    dateCreated: { type: Date, default: Date.now },

})


const ContactRequest = mongoose.model("ContactRequest", ContactRequestSchema)
module.exports = ContactRequest
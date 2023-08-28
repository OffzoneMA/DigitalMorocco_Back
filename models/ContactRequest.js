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
    cost:Number,
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },

    dateCreated: { type: Date, default: Date.now },

})


const ContactRequest = mongoose.model("ContactRequest", ContactRequestSchema)
module.exports = ContactRequest
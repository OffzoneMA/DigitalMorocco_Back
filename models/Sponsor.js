const mongoose = require("mongoose");

const SponsorSchema = new mongoose.Schema({
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Partner",
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    sponsorshipAmount: {
        type: Number,
        required: true
    },
    sponsorshipType: {
        type: String,
        enum: ['Financial', 'Venue Partner', 'Prize Sponsors' , 'Other'],
    },
    letter: {
        type: String,
    },
    requestType: {
        type: String,
        enum: ['Sent', 'Received'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },

    reasonForRejection: {
        type: String,
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 30*24*60*60*1000) 
    }
});

const Sponsor = mongoose.model("Sponsor", SponsorSchema);
module.exports = Sponsor;

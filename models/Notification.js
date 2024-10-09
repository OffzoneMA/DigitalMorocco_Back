// models/Notification.js
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    message2: {
        type: String,
        required: true,
    },
    reference: {
        type: mongoose.Schema.Types.ObjectId,
        required: false, 
    },
    referenceName: {
        type: String,
    },
    referenceName2: {
        type: String,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: false,
    },
    read: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: false,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
    },
    metadata: {
        type: Object,
        required: false, 
    },
});

const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;

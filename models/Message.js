const mongoose = require("mongoose");
const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the user, investor, or member who sent the message
    },
    text: String,
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;

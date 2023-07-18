const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    displayName: String,
    email: {
        type: String,
        unique: true
    },
    role: {
        type: String,
        enum: ['Admin', 'partner', 'investor', 'member']
    },
    password: String,
    dateCreated: { type: Date, default: Date.now },
    lastLogin: Date,
    approved:
    {
        type: String,
        enum: ['accepted', 'pending','rejected'],
        default: 'pending'
    },

})


const User = mongoose.model("User", UserSchema)
module.exports = User
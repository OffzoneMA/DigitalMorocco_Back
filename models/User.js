const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    displayName: String,
    email: {
        type: String,
        unique: true
    },
    role:{
        type: String,
        enum: ['admin', 'partner','investor','member'],
       
    },
    password: String,
    dateCreated:Date,
    lastLogin:Date,
    approved:
            {
        type: String,
        enum: ['accepted', 'pending','rejected'],
        default: 'pending'
    }

})


const User = mongoose.model("User", UserSchema)
module.exports = User
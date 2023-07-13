const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    displayName: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    dateCreated:Date,
    lastLogin:Date
})


const User = mongoose.model("User", UserSchema)
module.exports = User
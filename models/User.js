const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    phoneNumber: String,
    website: String,
    address: String,
    Country: String,
    cityState: String,
    region: String,
    image: String,
    displayName: String,
    googleId: String,
    linkedinId: String,
    facebookId: String,
    instagramId: String,
    twitterId : String,
    youtubeId: String,
    email: {
        type: String,
        unique: true
    },
    role: {
        type: String,
        enum: ['Admin', 'partner', 'investor', 'member' , 'associate']
    },
    password: String,
    dateCreated: { type: Date, default: Date.now },
    lastLogin: Date,
    status:
    {
        type: String,
        enum: ['accepted', 'pending', 'rejected', 'notVerified', 'verified'],
        default: 'notVerified'
    },
    language: String,

})


const User = mongoose.model("User", UserSchema)
module.exports = User
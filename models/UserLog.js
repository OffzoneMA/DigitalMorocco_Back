const mongoose = require("mongoose");

const UserLogSchema = new mongoose.Schema({
    type:
    {
        type: String,
        
    },
    dateCreated: { type: Date, default: Date.now },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    notes: String ,
    envStatus: {
        type: String,
        enum: ['dev', 'prod'],
        default: process.env.NODE_ENV === 'development' ? 'dev' : 'prod',
    },
})


const UserLog = mongoose.model("UserLog", UserLogSchema)
module.exports = UserLog
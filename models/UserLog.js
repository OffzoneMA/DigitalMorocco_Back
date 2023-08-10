const mongoose = require("mongoose");

const UserLogSchema = new mongoose.Schema({
    type:
    {
        type: String,
        enum: ['Account Initial Signup', 'Account Signin', 'Account Under Review', 'Enterprise Creation', 'Project Creation', 
            'Account Subscribed','Account Renew Subscription','Approved','Rejected','Verified','Account Signout','Account Update','Account Delete'],
    },
    dateCreated: { type: Date, default: Date.now },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    envStatus: {
        type: String,
        enum: ['dev', 'prod'],
        default: process.env.NODE_ENV === 'development' ? 'dev' : 'prod',
    },
})


const UserLog = mongoose.model("UserLog", UserLogSchema)
module.exports = UserLog
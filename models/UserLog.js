const mongoose = require("mongoose");

const UserLogSchema = new mongoose.Schema({
    type:
    {
        type: String,
        enum: ['account_signup', 'account_signin','approved','rejected','account_signout','account_update','account_delete'],
    },
    dateCreated: { type: Date, default: Date.now },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
})


const UserLog = mongoose.model("UserLog", UserLogSchema)
module.exports = UserLog
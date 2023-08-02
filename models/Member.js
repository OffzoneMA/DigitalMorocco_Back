const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    },
    
    name: String,
    description: String,
    image: String,
    rc_ice: String,
    document: [{
        name: String,
        link: String,
    }],
    dateCreated: { type: Date, default: Date.now },

    subscriptionId: {
        type: mongoose.Types.ObjectId,
        ref: "Subscription",
    },
    credits:{
        type:Number,
        default:0
    },
    subStatus:
    {
        type: String,
        enum: ['notActive', 'active'],
        default: 'notActive'
    },
    expireDate:Date
})


const Member = mongoose.model("Member", MemberSchema)
module.exports = Member
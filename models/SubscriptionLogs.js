const mongoose = require("mongoose");

const SubscriptionLogsSchema = new mongoose.Schema({
    member: {
        type: mongoose.Types.ObjectId,
        ref: "Member",
    },
    subscriptionId: {
        type: mongoose.Types.ObjectId,
        ref: "Subscription",
    },
    subscriptionDate: { type: Date, default: Date.now },
    credits:  Number,
    totalCredits: Number,
    subscriptionExpireDate: Date,
    type:{
        type: String,
        enum: ['Renew', 'Initial Purchase'],
        default: 'Initial Purchase',

    }
})


const SubscriptionLogs = mongoose.model("SubscriptionLogs", SubscriptionLogsSchema)
module.exports = SubscriptionLogs
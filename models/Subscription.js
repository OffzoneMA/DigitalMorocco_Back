const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
    plan: { type: mongoose.Types.ObjectId,
        ref: 'SubscriptionPlan', 
        required: true 
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    billing: { type: String, default: 'month' },
    totalCredits: Number,
    subscriptionStatus: { type: String, enum: ['active', 'cancelled', 'paused' , 'notActive'], default: 'notActive' } ,
    transactions: [
        {type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }
    ],
    pendingUpgrade: {
        newPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
        newCredits: Number,
        previousPlanName: String,
        newPlanName: String,
        newBilling: { type: String, enum: ['month', 'year' , null] },
        newExpirationDate: {type:  Date},
        price: Number,
        currency: String
    },
    autoRenew: {
        type: Boolean,
        default: true
    },
    nextBillingDate: {
        type: Date
    },
    dateCreated: { 
        type: Date, 
        default: Date.now 
    },
    dateExpired: { 
        type: Date 
    },
    dateStopped: { 
        type: Date 
    },
    discountCode: { 
        type: String 
    },
    isCanceled: {
        type: Boolean,
        default: false
    },
    metadata: { 
        type: mongoose.Schema.Types.Mixed 
    }
})


const Subscription = mongoose.model("Subscription", SubscriptionSchema)
module.exports = Subscription
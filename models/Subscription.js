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
    paymentMethodType: 
    {   type: String, 
        default: 'Card' 
    },
    totalCredits: Number,
    paymentMethod: { type: String },
    cardLastFourDigits: { type: Number },
    cardexpiration: { type: String },
    subscriptionStatus: { type: String, enum: ['active', 'cancelled', 'paused' , 'notActive'], default: 'notActive' } ,
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
    metadata: { 
        type: mongoose.Schema.Types.Mixed 
    }
})


const Subscription = mongoose.model("Subscription", SubscriptionSchema)
module.exports = Subscription
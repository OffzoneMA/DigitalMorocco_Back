const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
    plan: { type: mongoose.Types.ObjectId,
        ref: 'SubscriptionPlan', 
        required: true 
    },
    billing: { type: String, default: 'month' },
    paymentMethodType: 
    {   type: String, 
        default: 'Card' 
    },
    paymentMethod: { type: String },
    cardLastFourDigits: { type: Number },
    cardexpiration: { type: String },
    subscriptionStatus: { type: String, enum: ['active', 'cancelled', 'paused'], default: 'active' } ,
    dateCreated: { type: Date, default: Date.now },
    dateExpired: { type: Date },
    dateStopped: { type: Date },
    discountCode: { type: String },
    metadata: { },
})


const Subscription = mongoose.model("Subscription", SubscriptionSchema)
module.exports = Subscription
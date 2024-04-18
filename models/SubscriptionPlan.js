const mongoose = require("mongoose");

const SubscriptionPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: { type: String },
    dateCreated: { type: Date, default: Date.now },
    isAvailable: { type: Boolean, default: true }, 
    featureDescriptions: [String],
    price: Number,
    duration:Number,
    planType: { type: String, enum: ['Basic', 'Pro', 'Enterprise'], required: true },
    credits: { type: Number, default: 0 },
    hasTrial: { type: Boolean, default: false }, 
    trialDays: { type: Number },
    trialEndDate: { type: Date },
})


const SubscriptionPlan = mongoose.model("SubscriptionPlan", SubscriptionPlanSchema)
module.exports = SubscriptionPlan
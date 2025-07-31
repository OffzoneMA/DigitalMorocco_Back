const mongoose = require("mongoose");

const SubscriptionPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    description: { type: String },
    dateCreated: { type: Date, default: Date.now },
    isAvailable: { type: Boolean, default: true }, 
    featureDescriptions: [String],
    price: Number,
    annualPrice: Number, 
    annualDiscountRate: Number,
    discountRate: Number,
    duration:Number,
    planType: { type: String, required: true },
    credits: { type: Number, default: 0 },
    hasTrial: { type: Boolean, default: false }, 
    trialDays: { type: Number },
    trialEndDate: { type: Date },
    forUser : {
        type: String ,
        enum : ["Member" , "Investor"],
        default: "Member"
    }
})


const SubscriptionPlan = mongoose.model("SubscriptionPlan", SubscriptionPlanSchema)
module.exports = SubscriptionPlan
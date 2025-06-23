const mongoose = require("mongoose");

const SubscriptionLogsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    subscription: {
        type: mongoose.Types.ObjectId,
        ref: "Subscription",
    },
    subscriptionDate: { type: Date, default: Date.now },
    credits:  Number,
    totalCredits: Number,
    subscriptionExpireDate: Date,
    type:{
        type: String,
        enum: ['Renew', 'Initial Purchase' ,'Cancel' ,'Upgrade' , 'Add Payment Method' , 'Change Payment Method' , 'Purchase Credits'],
        default: 'Initial Purchase',

    },
    transactionId: {
        type: String,
        description: 'Identifiant de la transaction de paiement'
    },
    notes: {
        type: String,
        description: 'Commentaires ou notes supplémentaires concernant l’abonnement'
    }
})


const SubscriptionLogs = mongoose.model("SubscriptionLogs", SubscriptionLogsSchema)
module.exports = SubscriptionLogs
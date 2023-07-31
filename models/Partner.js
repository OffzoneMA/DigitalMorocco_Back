const mongoose = require("mongoose");

const PartnerSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    },
    name: String,
    description: String,
    image: String,
    country: String,
    subscription: [{
        type: mongoose.Types.ObjectId,
        ref: "Subscription"
    }],
    document: [{
        name: String,
        link: String,
    }],
    num_rc: String,
    dateCreated: { type: Date, default: Date.now },

})


const Partner = mongoose.model("Partner", PartnerSchema)
module.exports = Partner
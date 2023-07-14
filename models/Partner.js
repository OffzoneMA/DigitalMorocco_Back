const mongoose = require("mongoose");

const PartnerSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    },

    name: {
        type: String,
        unique: true,
        required: true
    },
    
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
    }]

})


const Partner = mongoose.model("Partner", PartnerSchema)
module.exports = Partner
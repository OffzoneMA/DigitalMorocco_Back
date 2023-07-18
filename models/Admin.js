const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    },

    requests_members: [{
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        rc: String,
        ice: String,
        date: Date
    }],

    requests_partner: [{
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        num_rc: String,
        date: Date
    }],

    requests_investors: [{
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        link: String,
        date: Date
    }]

})


const Admin = mongoose.model("Admin", AdminSchema)
module.exports = Admin
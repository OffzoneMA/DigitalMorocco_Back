const mongoose = require("mongoose");

const DocumentsSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    title: String ,
    documentName: String,
    link: {type:String},
    docType: String,
    shareWith: {
        type: String,
        // enum: ["all", "Investors", "Partners","Marketing Team" , "group", "individual"],
        default: "Individual"
    },
    // shareWithUser: {
    //     type: mongoose.Types.ObjectId,
    //     ref: "User"
    // },
    shareWithUsers: [{
        type: mongoose.Types.ObjectId,
        // ref: "User"
    }]
   
})


const Document = mongoose.model("Document", DocumentsSchema)
module.exports = Document
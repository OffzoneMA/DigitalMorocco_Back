const mongoose = require("mongoose");

const DocumentsSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "Member",
    },
    uploadDate :Date,
    documentName: String,
    uploadBy: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    link: {type:String},
    docType: String,
    shareWith: String,
    shareWithUsers : String
   
})


const Document = mongoose.model("Document", DocumentsSchema)
module.exports = Document
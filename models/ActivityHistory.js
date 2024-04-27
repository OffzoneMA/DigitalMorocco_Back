const mongoose = require("mongoose");

const ActivityHistorySchema  = new mongoose.Schema({
    eventType: {
        type: String,
        enum: ['document_shared', 'contact_request_sent', 'event_registered', 
        'project_created', 'event_attended', 'document_uploaded', 'project_completed', 
        'legal_document_uploaded', 'other'],
        required: true
    },
    eventDetails: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User' 
    },
    finalDetails: {
        type: String
        //exp : For project  (Save as Draft)
    },
    actionTargetType: {
        type: String ,
        default: ''
    },
    actionTarget: {
        type: String /** exp : Id document , ID projet , ID event , ID blog */,
        default: ''
    },
    targetUser: {
        usertype: {
            type:String , 
            enum:['Member' , 'Investor' , 'Partner' , 'User']
        } , 
        userId: String, /*ID Investor , ID partner , ID user etc ...*/
    }
})


const ActivityHistory  = mongoose.model("ActivityHistory ", ActivityHistorySchema )
module.exports = ActivityHistory 
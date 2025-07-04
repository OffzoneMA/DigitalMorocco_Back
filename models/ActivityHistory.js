const mongoose = require("mongoose");

const ActivityHistorySchema  = new mongoose.Schema({
    eventType: {
        type: String,
        enum: [
            'project_created', 'project_updated', 'project_deleted', 'project_status_updated',
            'project_shared', 'milestone_add_to_project' , 'milestone_removed' , 'company_created', 
            'company_updated' , 'document_created', 'project_logo_deleted', 'project_logo_updated',
            'document_updated', 'document_deleted', 'document_shared', 'employee_image_deleted',
            'profile_updated', 'employee_added', 'employee_removed', 'company_logo_deleted',
            'employee_updated', 'legal_document_created', 'legal_document_updated', 'employee_deleted',
            'legal_document_deleted' , 'legal_document_download' ,  'contact_sent',
            'event_ticket_download' , 'event_ticket_view' , 'event_registered' ,
            'event_attended' , 'password_changed', 'account_deleted', 'password_reset',
            'new_subscription' , 'subscription_upgraded', 'subscription_renew' , 'purchase_credits',
            'subscription_canceled' , 'subscription_auto_canceled' ,'profile_update_lang_reg' , 'profile_update_password',
            'profile_updated' ,'contact_request_accepted' ,'contact_request_approved'  ,'contact_request_rejected' , 
            'contact_request_received' , 'sponsor_request_send' , 'sponsor_request_received' , 'sponsor_request_approved' ,
            'sponsor_request_rejected'
        ],
        required: true
    },
    eventData: {
        type: Map,
        of: mongoose.Schema.Types.Mixed, // Permet de stocker des données variées
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }
})


const ActivityHistory  = mongoose.model("ActivityHistory ", ActivityHistorySchema )
module.exports = ActivityHistory 
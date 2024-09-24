const ActivityHistory = require('../models/ActivityHistory');
const Event = require("../models/Event");
const Project = require("../models/Project");
const User = require('../models/User');
const Member = require('../models/Member');
const Investor = require('../models/Investor');
const Partner = require('../models/Partner');
const Document = require('../models/Document');

// async function createActivityHistory(data) {
//     try {
//         let eventDetails = '';

//         switch (data.eventType) {
//             case 'document_shared':
//                 eventDetails = 'Shared Document';
//                 break;
//             case 'contact_request_sent':
//                 eventDetails = 'Sent Contact Request';
//                 break;
//             case 'event_registered':
//                 eventDetails = 'Register an Event';
//                 if(data.actionTarget) {
//                     const event = await Event.findById(data.actionTarget);
//                     if (!event) {
//                         throw new Error('Event not found with ID: ' + data.actionTarget);
//                     }
//                 }
//                 break;
//             case 'project_created':
//                 eventDetails = 'Created Project';
//                 if(data.actionTarget) {
//                     const project = await Project.findById(data.actionTarget);
//                     if (!project) {
//                         throw new Error('Project not found with ID: ' + data.actionTarget);
//                     }
//                 }
//                 break;
//             case 'event_attended':
//                 eventDetails = 'Attending Event';
//                 if(data.actionTarget) {
//                     const event = await Event.findById(data.actionTarget);
//                     if (!event) {
//                         throw new Error('Event not found with ID: ' + data.actionTarget);
//                     }
//                 }
//                 break;
//             case 'document_uploaded':
//             case 'legal_document_uploaded':
//                 eventDetails = 'Uploaded Document';
//                 break;
//             default:
//                 eventDetails = 'Other Event';
//         }

//         if (!data.eventDetails || data.eventDetails.trim() === '') {
//             data.eventDetails = eventDetails;
//         }        

//         const activityHistory = await ActivityHistory.create(data);
//         return activityHistory;
//     } catch (error) {
//         throw new Error('Error creating activity history: ' + error.message);
//     }
// }

async function createActivityHistory(userId, eventType, eventData) {
    const event = new ActivityHistory({
        eventType,
        eventData,
        user: userId
    });
    
    try {
        await event.save();
        console.log('Event logged successfully');
    } catch (err) {
        console.error('Error logging event:', err);
    }
}

async function getAllActivityHistories() {
    try {
        const activityHistories = await ActivityHistory.find()
            .populate({
                path: 'user'
            })
            .exec();

        return activityHistories;
    } catch (error) {
        throw new Error('Error getting all activity histories: ' + error.message);
    }
}


async function getAllActivityHistoriesByUser(userId) {
    try {
        const events = await ActivityHistory.find({ user: userId })
            .sort({ timestamp: -1 })
            .populate({
                path: 'user'
            })
            .exec();
        
        return events;
    } catch (err) {
        throw new Error('Error retrieving user history: ' + err.message);
    }
}

async function searchActivityHistoriesByUser(userId, searchTerm) {
    try {
        const regex = new RegExp(searchTerm, 'i'); 
        const events = await ActivityHistory.find({
            user: userId,
            $or: [
                { eventType: regex }, 
                { 'eventData.target': { $regex: regex } },  
                // { 'eventData.documentTitle': { $regex: regex } },  
                // { 'eventData.someOtherField': { $regex: regex } }            
            ]
        })
            .sort({ timestamp: -1 })
            .populate({
                path: 'user'
            })
            .exec();
        
        return events;
    } catch (err) {
        throw new Error('Error searching user history: ' + err.message);
    }
}

async function deleteActivityHistory(id) {
    try {
        const activityHistory = await ActivityHistory.findByIdAndDelete(id);
        if (!activityHistory) {
            throw new Error('Activity history not found');
        }
        return activityHistory;
    } catch (error) {
        throw new Error('Error deleting activity history: ' + error.message);
    }
}

module.exports = {createActivityHistory ,getAllActivityHistories ,  getAllActivityHistoriesByUser , 
    deleteActivityHistory  , searchActivityHistoriesByUser
 }
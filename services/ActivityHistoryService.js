const ActivityHistory = require('../models/ActivityHistory');
const Event = require("../models/Event");
const Project = require("../models/Project");
const User = require('../models/User');
const Member = require('../models/Member');
const Investor = require('../models/Investor');
const Partner = require('../models/Partner');
const Document = require('../models/Document');
const mongoose = require('mongoose');

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
// Fonction utilitaire pour créer les dates de début et fin d'une journée

const getDateRange = (date) => {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate };
};

// Fonction utilitaire pour construire la requête de base avec les filtres
const buildBaseQuery = (date, userIds) => {
    let query = {};
    
    // Ajouter le filtre de date si spécifié
    if (date) {
        const { startDate, endDate } = getDateRange(date);
        query.timestamp = { $gte: startDate, $lte: endDate };
    }
    
    // Ajouter le filtre d'utilisateurs si spécifié
    if (userIds && userIds.length > 0) {
        query.user = { 
            $in: userIds.map(id => mongoose.Types.ObjectId(id)) 
        };
    }
    
    return query;
};

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

async function getAllActivityHistories(date, userIds) {
    try {
        const query = buildBaseQuery(date, userIds);
        
        const activityHistories = await ActivityHistory.find(query)
            .sort({ timestamp: -1 })
            .populate('user')
            .exec();

        return activityHistories;
    } catch (error) {
        throw new Error('Error getting all activity histories: ' + error.message);
    }
}

async function getMemberActivityHistories(date, userIds) {
    try {
        const query = buildBaseQuery(date, userIds);
        
        const memberHistories = await ActivityHistory.find(query)
            .populate({
                path: 'user',
                match: { role: 'member' }
            })
            .sort({ timestamp: -1 })
            .exec();

        return memberHistories.filter(history => history.user !== null);
    } catch (error) {
        throw new Error('Error getting member activity histories: ' + error.message);
    }
}

async function getInvestorActivityHistories(date, userIds) {
    try {
        const query = buildBaseQuery(date, userIds);
        
        const investorHistories = await ActivityHistory.find(query)
            .populate({
                path: 'user',
                match: { role: 'investor' }
            })
            .sort({ timestamp: -1 })
            .exec();

        return investorHistories.filter(history => history.user !== null);
    } catch (error) {
        throw new Error('Error getting investor activity histories: ' + error.message);
    }
}

async function getPartnerActivityHistories(date, userIds) {
    try {
        const query = buildBaseQuery(date, userIds);
        
        const partnerHistories = await ActivityHistory.find(query)
            .populate({
                path: 'user',
                match: { role: 'partner' }
            })
            .sort({ timestamp: -1 })
            .exec();

        return partnerHistories.filter(history => history.user !== null);
    } catch (error) {
        throw new Error('Error getting partner activity histories: ' + error.message);
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
                // { eventType: regex }, 
                { 'eventData.targetName': { $regex: regex } },  
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

async function getUsersByRole(role = null) {
    try {
        // Agrégation pour récupérer les utilisateurs uniques des historiques
        const pipeline = [
            // Faire le populate du champ user
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            // Dérouler le tableau userDetails pour accéder aux propriétés
            { $unwind: '$userDetails' },
            // Filtrer par rôle si spécifié
            ...(role ? [{
                $match: {
                    'userDetails.role': role
                }
            }] : []),
            // Grouper par utilisateur pour avoir des utilisateurs uniques
            {
                $group: {
                    _id: '$userDetails._id',
                    name: { $first: '$userDetails.displayName' },
                    email: { $first: '$userDetails.email' },
                    role: { $first: '$userDetails.role' }
                }
            },
            // Trier par nom
            { $sort: { name: 1 } }
        ];

        const users = await ActivityHistory.aggregate(pipeline);
        return users;
    } catch (error) {
        throw new Error('Error getting users from activity history: ' + error.message);
    }
}

module.exports = {createActivityHistory ,getAllActivityHistories ,  getAllActivityHistoriesByUser , 
    deleteActivityHistory  , searchActivityHistoriesByUser , getMemberActivityHistories ,
     getInvestorActivityHistories , getPartnerActivityHistories , getUsersByRole
 }
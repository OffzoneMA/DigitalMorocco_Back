const ActivityHistory = require('../models/ActivityHistory');
const Event = require("../models/Event");
const Project = require("../models/Project");
const User = require('../models/User');
const Member = require('../models/Member');
const Investor = require('../models/Investor');
const Partner = require('../models/Partner');
const Document = require('../models/Document');

async function createActivityHistory(data) {
    try {
        let eventDetails = '';

        switch (data.eventType) {
            case 'document_shared':
                eventDetails = 'Shared Document';
                break;
            case 'contact_request_sent':
                eventDetails = 'Sent Contact Request';
                break;
            case 'event_registered':
                eventDetails = 'Register an Event';
                if(data.actionTarget) {
                    const event = await Event.findById(data.actionTarget);
                    if (!event) {
                        throw new Error('Event not found with ID: ' + data.actionTarget);
                    }
                }
                break;
            case 'project_created':
                eventDetails = 'Created Project';
                if(data.actionTarget) {
                    const project = await Project.findById(data.actionTarget);
                    if (!project) {
                        throw new Error('Project not found with ID: ' + data.actionTarget);
                    }
                }
                break;
            case 'event_attended':
                eventDetails = 'Attending Event';
                if(data.actionTarget) {
                    const event = await Event.findById(data.actionTarget);
                    if (!event) {
                        throw new Error('Event not found with ID: ' + data.actionTarget);
                    }
                }
                break;
            case 'document_uploaded':
            case 'legal_document_uploaded':
                eventDetails = 'Uploaded Document';
                break;
            default:
                eventDetails = 'Other Event';
        }

        if (!data.eventDetails || data.eventDetails.trim() === '') {
            data.eventDetails = eventDetails;
        }        

        const activityHistory = await ActivityHistory.create(data);
        return activityHistory;
    } catch (error) {
        throw new Error('Error creating activity history: ' + error.message);
    }
}

async function getAllActivityHistories() {
    try {
        const activityHistories = await ActivityHistory.find();
        const populatedActivityHistories = await Promise.all(activityHistories.map(async (history) => {
            let actionTargetDetails = null;
            let targetUserDetails = null;

            if (history.actionTarget) {
                switch (history.eventType) {
                    case 'document_shared':
                    case 'document_uploaded':
                        actionTargetDetails = await Document.findById(history.actionTarget);
                        break;
                    case 'project_created':
                        actionTargetDetails = await Project.findById(history.actionTarget);
                        break;
                    case 'event_registered':
                    case 'event_attended':
                        actionTargetDetails = await Event.findById(history.actionTarget);
                        break;
                    default:
                        actionTargetDetails = null;
                }
            }

            if (history.targetUser && history.targetUser.usertype === 'Investor') {
                targetUserDetails = await Investor.findById(history.targetUser.userId);
            } 
            else if (history.targetUser && history.targetUser.usertype === 'Member') {
                targetUserDetails = await Member.findById(history.targetUser.userId);
            }else if (history.targetUser && history.targetUser.usertype === 'Partner') {
                targetUserDetails = await Partner.findById(history.targetUser.userId);
            }else if (history.targetUser) {
                targetUserDetails = await User.findById(history.targetUser.userId);
            }

            return {
                ...history.toObject(),
                actionTargetDetails,
                targetUserDetails,
            };
        }));
        return populatedActivityHistories;
    } catch (error) {
        throw new Error('Error getting all activity histories: ' + error.message);
    }
}

const getAllActivityHistoriesByUser = async (userId) => {
    try {
        const activityHistories = await ActivityHistory.find({ user: userId });
        const populatedActivityHistories = await Promise.all(activityHistories.map(async (history) => {
            let actionTargetDetails = null;
            let targetUserDetails = null;

            if (history.actionTarget) {
                switch (history.eventType) {
                    case 'document_shared':
                    case 'document_uploaded':
                        actionTargetDetails = await Document.findById(history.actionTarget);
                        break;
                    case 'project_created':
                        actionTargetDetails = await Project.findById(history.actionTarget);
                        break;
                    case 'event_registered':
                    case 'event_attended':
                        actionTargetDetails = await Event.findById(history.actionTarget);
                        break;
                    default:
                        actionTargetDetails = null;
                }
            }

            if (history.targetUser && history.targetUser.usertype === 'Investor') {
                targetUserDetails = await Investor.findById(history.targetUser.userId);
            } 
            else if (history.targetUser && history.targetUser.usertype === 'Member') {
                targetUserDetails = await Member.findById(history.targetUser.userId);
            }else if (history.targetUser && history.targetUser.usertype === 'Partner') {
                targetUserDetails = await Partner.findById(history.targetUser.userId);
            }else if (history.targetUser) {
                targetUserDetails = await User.findById(history.targetUser.userId);
            }

            return {
                ...history.toObject(),
                actionTargetDetails,
                targetUserDetails,
            };
        }));
        return populatedActivityHistories;
    } catch (error) {
        throw new Error('Error getting activity histories by member: ' + error.message);
    }
};



module.exports = {createActivityHistory ,getAllActivityHistories ,  getAllActivityHistoriesByUser }
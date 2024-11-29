const SubscriptionLogs = require('../models/SubscriptionLogs');
const Subscription = require('../models/Subscription');


const createSubscriptionLog = async (subscriptionId,logData) => {
        try {
            const subscription = await Subscription.findById(subscriptionId);
            if (!subscription) {
               throw new Error('Subscription not found.');
            }
            const log = new SubscriptionLogs({
                ...logData,
                user: subscription.user,
                subscription: subscriptionId,
            });
            return await log.save();
        } catch (error) {
            throw new Error(`Error creating subscription log: ${error.message}`);
        }
    };

const getAllSubscriptionLogs = async (args) => {
        return await SubscriptionLogs.find()
        .sort({ subscriptionDate: 'desc' })
                .populate([{ path: 'user' }, { path: 'subscriptionId'}])
        .skip(args.start ? args.start : null).limit(args.qt ? args.qt : 8);
}

const getAllSubscriptionLogsUser = async (userId,args) => {
        return await SubscriptionLogs.find({ user: userId })
        .sort({ subscriptionDate: 'desc' })
                .populate({ path: 'subscriptionId' })
        .skip(args.start ? args.start : null).limit(args.qt ? args.qt : 8);
}

async function getSubscriptionLogs(subscriptionId) {
        try {
            const logs = await SubscriptionLogs.find({ subscription: subscriptionId });
            return logs;
        } catch (error) {
            throw new Error('Error retrieving subscription logs: ' + error.message);
        }
    }
    

const getSubscriptionLogById = async (id) => {
        try {
            return await SubscriptionLogs.findById(id);
        } catch (error) {
            throw new Error(`Error fetching subscription log by ID: ${error.message}`);
        }
    };
    
    const updateSubscriptionLog = async (id, updateData) => {
        try {
            return await SubscriptionLogs.findByIdAndUpdate(id, updateData, { new: true });
        } catch (error) {
            throw new Error(`Error updating subscription log: ${error.message}`);
        }
    };
    
    const deleteSubscriptionLog = async (id) => {
        try {
            return await SubscriptionLogs.findByIdAndDelete(id);
        } catch (error) {
            throw new Error(`Error deleting subscription log: ${error.message}`);
        }
    };


module.exports = { createSubscriptionLog, getAllSubscriptionLogsUser, getAllSubscriptionLogs ,
    getSubscriptionLogById, updateSubscriptionLog, deleteSubscriptionLog
}
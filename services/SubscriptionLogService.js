const SubscriptionLogs = require('../models/SubscriptionLogs');

const createSubscriptionLog= async (sub) => {
    return await SubscriptionLogs.create(sub)
      
}

const getAllSubscriptionLogs = async (args) => {
        return await SubscriptionLogs.find()
        .sort({ subscriptionDate: 'desc' })
                .populate([{ path: 'member', select: '_id email ' }, { path: 'subscriptionId', select: '_id name price duration' }])
        .skip(args.start ? args.start : null).limit(args.qt ? args.qt : 8);
}

const getAllSubscriptionLogsUser = async (memberId,args) => {
        return await SubscriptionLogs.find({ member: memberId })
        .sort({ subscriptionDate: 'desc' })
                .populate({ path: 'subscriptionId', select: '_id name price duration' })
        .skip(args.start ? args.start : null).limit(args.qt ? args.qt : 8);
}


module.exports = { createSubscriptionLog, getAllSubscriptionLogsUser, getAllSubscriptionLogs }
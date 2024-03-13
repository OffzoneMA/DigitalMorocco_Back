const Subscription = require('../models/Subscription');

const getSubscriptions = async () => {
    return await Subscription.find()
}


const getSubscriptionById = async (id) => {
    return await Subscription.findById(id);
}
module.exports = { getSubscriptions, getSubscriptionById }
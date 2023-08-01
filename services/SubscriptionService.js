const Subscription = require('../models/Subscription');

const getSubscriptions = async () => {
    return await Subscription.find()
}



module.exports = { getSubscriptions }
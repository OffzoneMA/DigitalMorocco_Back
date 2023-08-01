const SubscriptionService = require("../services/SubscriptionService");



const getSubscriptions = async (req, res) => {
    try {
        const result = await SubscriptionService.getSubscriptions();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}




module.exports = { getSubscriptions }
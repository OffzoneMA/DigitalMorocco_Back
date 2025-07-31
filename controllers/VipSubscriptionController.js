const VipSubscriptionService = require('../services/VipSubscriptionService');

const subscribeToVip = async (req, res) => {
    const userId = req.userId;
    const { serviceType } = req.body;
    try {
        const subscription = await VipSubscriptionService.subscribeToService(userId, serviceType);
        res.status(201).json(subscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const unsubscribeFromVip = async (req, res) => {
    const userId = req.userId;
    const { serviceType } = req.body;
    try {
        const result = await VipSubscriptionService.unsubscribe(userId, serviceType);
        res.status(200).json({ message: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getAllActiveSubscriptions = async (req, res) => {
    try {
        const subscriptions = await VipSubscriptionService.getAllActiveSubscriptions();
        res.status(200).json(subscriptions);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getSubscriptionByUserId = async (req, res) => {
    const userId = req.userId;
    try {
        const subscription = await VipSubscriptionService.getSubscriptionByUserId(userId);
        if (!subscription) {
            return res.status(404).json({ message: 'No active subscription found for this user.' });
        }
        res.status(200).json(subscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getSubscriptionById = async (req, res) => {
    const { subscriptionId } = req.params;
    try {
        const subscription = await VipSubscriptionService.getSubscriptionById(subscriptionId);
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found.' });
        }
        res.status(200).json(subscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getAllActiveSubscriptionsByServiceType = async (req, res) => {
    const { serviceType } = req.params;
    try {
        const subscriptions = await VipSubscriptionService.getAllActiveSubscriptionsByServiceType(serviceType);
        res.status(200).json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getAllActiveSubscriptionsByServiceTypeAndUser = async (req, res) => {
    const { serviceType } = req.params;
    const userId = req.userId;
    try {
        const subscriptions = await VipSubscriptionService.getAllActiveSubscriptionsByServiceType(serviceType);
        const userSubscriptions = subscriptions.filter(sub => sub.user.toString() === userId);
        res.status(200).json(userSubscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getAllActiveSubscriptionsByServiceTypeAndUserId = async (req, res) => {
    const { serviceType, userId } = req.params;
    try {
        const subscriptions = await VipSubscriptionService.getAllActiveSubscriptionsByServiceType(serviceType);
        const userSubscriptions = subscriptions.filter(sub => sub.user.toString() === userId);
        res.status(200).json(userSubscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    subscribeToVip , unsubscribeFromVip , getAllActiveSubscriptions,
    getSubscriptionByUserId, getSubscriptionById, getAllActiveSubscriptionsByServiceType ,
    getAllActiveSubscriptionsByServiceTypeAndUser, getAllActiveSubscriptionsByServiceTypeAndUserId , 
    getAllActiveSubscriptionsByServiceType  
};
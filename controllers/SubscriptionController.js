const SubscriptionService = require("../services/SubscriptionService");

const getSubscriptions = async (req, res) => {
    try {
        const result = await SubscriptionService.getSubscriptions();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}

const createSubscriptionForUser = async (req, res) => {
    const planId = req.params.planId;
    const userId = req.userId;
    try {
        const subscription = await SubscriptionService.createSubscriptionForUser(userId, planId, req.body);
        res.status(201).json(subscription);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const upgradeSubscription = async (req, res) => {
    const { subscriptionId } = req.params;

    const {  newPlanId, newBilling } = req.body;
    try {
        const subscription = await SubscriptionService.upgradeSubscription(subscriptionId, newPlanId, newBilling);
        res.json(subscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getSubscriptionById = async (req, res) => {
    try {
        const subscription = await SubscriptionService.getSubscriptionById(req.params.id);
        if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
        res.status(200).json(subscription);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const cancelSubscription = async (req, res) => {
    try {
        const subscription = await SubscriptionService.cancelSubscription(req.params.id);
        res.status(200).json(subscription);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const autoCancelExpiredSubscriptions = async (req, res) => {
    try {
        const subscriptions = await SubscriptionService.autoCancelExpiredSubscriptions();
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const pauseSubscription = async (req, res) => {
    try {
        const subscription = await SubscriptionService.pauseSubscription(req.params.id);
        res.status(200).json(subscription);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getSubscriptionsByUser = async (req, res) => {
    try {
        const subscriptions = await SubscriptionService.getSubscriptionsByUser(req.userId);
        console.log(subscriptions)
        res.status(200).json(subscriptions);
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message });
    }
};

const renewSubscription = async (req, res) => {
    const { subscriptionId } = req.params;
    try {
        const subscription = await SubscriptionService.renewSubscription(subscriptionId);
        res.json(subscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

async function checUserkSubscription(req, res) {
    try {
        const userId = req.userId;
        const isValid = await SubscriptionService.checkUserSubscription(userId);
        
        return res.status(200).json({ valid: isValid });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// Update a subscription by ID
const updateSubscription = async (req, res) => {
    try {
        const subscription = await SubscriptionService.updateSubscription(req.params.id, req.body);
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }
        res.json(subscription);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a subscription by ID
const deleteSubscription = async (req, res) => {
    try {
        const subscription = await SubscriptionService.deleteSubscription(req.params.id);
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }
        res.json({ message: 'Subscription deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { getSubscriptions, createSubscriptionForUser, upgradeSubscription, getSubscriptionById,
    cancelSubscription, autoCancelExpiredSubscriptions, pauseSubscription, updateSubscription,
    getSubscriptionsByUser, renewSubscription  , checUserkSubscription ,  deleteSubscription}
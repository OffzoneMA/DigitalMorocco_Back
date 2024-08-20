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
    const { userId, planId } = req.params;
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

const addPaymentMethod = async (req, res) => {
    const { userId } = req.params;
    const {paymentMethodType, paymentMethod, cardLastFourDigits, cardExpiration } = req.body;
    try {
        const subscription = await SubscriptionService.addPaymentMethod(userId, paymentMethodType, paymentMethod, cardLastFourDigits, cardExpiration);
        res.json(subscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const changePaymentMethod = async (req, res) => {
    const { subscriptionId } = req.params;
    const { paymentMethodType, paymentMethod, cardLastFourDigits, cardExpiration } = req.body;
    try {
        const subscription = await SubscriptionService.changePaymentMethod(subscriptionId, paymentMethodType, paymentMethod, cardLastFourDigits, cardExpiration);
        res.json(subscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getSubscriptionsByUser = async (req, res) => {
    try {
        const subscriptions = await subscriptionService.getSubscriptionsByUser(req.params.userId);
        res.status(200).json(subscriptions);
    } catch (err) {
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

module.exports = { getSubscriptions, createSubscriptionForUser, upgradeSubscription, getSubscriptionById,
    cancelSubscription, autoCancelExpiredSubscriptions, pauseSubscription, addPaymentMethod, changePaymentMethod,
    getSubscriptionsByUser, renewSubscription }
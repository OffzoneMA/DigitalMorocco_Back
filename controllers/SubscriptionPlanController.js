const SubscriptionPlanService = require("../services/SubscriptionPlanService");

async function createSubscriptionPlan(req, res) {
    const userId = req.params.userId;
    const planData = req.body;
    try {
        const isAdmin = await checkUserRole(userId);
        if (!isAdmin) {
            return res.status(403).json({ error: 'Only admins can create subscription plans' });
        }

        const plan = await SubscriptionPlanService.createSubscriptionPlan(userId, planData);
        res.status(201).json(plan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


async function getSubscriptionPlanById(req, res) {
    const planId = req.params.planId;

    try {
        const subscriptionPlan = await SubscriptionPlanService.getSubscriptionPlanById(planId);
        res.json({ success: true, subscriptionPlan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function getAllSubscriptionPlans(req, res) {
    try {
        const plans = await SubscriptionPlanService.getAllSubscriptionPlans();
        res.json(plans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateSubscriptionPlan(req, res) {
    const planId = req.params.planId;
    const newData = req.body;
    try {
        const updatedPlan = await SubscriptionPlanService.updateSubscriptionPlan(planId, newData);
        res.json(updatedPlan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteSubscriptionPlan(req, res) {
    const planId = req.params.planId;
    try {
        const result = await SubscriptionPlanService.deleteSubscriptionPlan(planId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getSubscriptionPlanById, getAllSubscriptionPlans, updateSubscriptionPlan,
 deleteSubscriptionPlan, createSubscriptionPlan}
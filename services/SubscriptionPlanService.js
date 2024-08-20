const SubscriptionPlan = require('../models/SubscriptionPlan');
const User = require('../models/User');

async function checkUserRole(userId) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const isAdmin = user?.role?.toLowerCase() === 'admin';

        return isAdmin;
    } catch (error) {
        throw new Error('Error checking user role: ' + error.message);
    }
}

async function getAllSubscriptionPlans() {
    try {
        const subscriptionPlans = await SubscriptionPlan.find({ isAvailable: true });
        return subscriptionPlans;
    } catch (error) {
        throw new Error('Error getting all subscription plans: ' + error.message);
    }
}

async function getSubscriptionPlanById(planId) {
    try {
        const subscriptionPlan = await SubscriptionPlan.findById(planId);
        if (!subscriptionPlan) {
            throw new Error('Subscription plan not found');
        }
        return subscriptionPlan;
    } catch (error) {
        throw new Error('Error getting subscription plan by ID: ' + error.message);
    }
}

async function createSubscriptionPlan(userId, planData) {
    try {
        const isAdmin = await checkUserRole(userId);
        if (!isAdmin) {
            throw new Error('Only admins can create subscription plans');
        }

        planData.creator = userId;

        const plan = await SubscriptionPlan.create(planData);
        return plan;
    } catch (error) {
        throw new Error('Error creating subscription plan: ' + error.message);
    }
}

async function updateSubscriptionPlan(planId, newData) {
    try {
        const plan = await SubscriptionPlan.findByIdAndUpdate(planId, newData, { new: true });
        return plan;
    } catch (error) {
        throw new Error('Error updating subscription plan: ' + error.message);
    }
}

async function deleteSubscriptionPlan(planId) {
    try {
        await SubscriptionPlan.findByIdAndDelete(planId);
        return { message: 'Subscription plan deleted successfully' };
    } catch (error) {
        throw new Error('Error deleting subscription plan: ' + error.message);
    }
}

module.exports = { getAllSubscriptionPlans, getSubscriptionPlanById, createSubscriptionPlan, 
updateSubscriptionPlan , deleteSubscriptionPlan ,checkUserRole}
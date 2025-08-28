const VipSubscription = require('../models/VipSubscription');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const cron = require('node-cron');

const CREDIT_COST = {
  VIP_NEWSLETTER: 210,
  VIP_CLUB: 215
};

const subscribeToService = async (userId, serviceType) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const subscription = await Subscription.findOne({ user: userId }).sort({ dateCreated: -1 });

    // Check plan eligibility
    if (!['Standard', 'Standard In', 'Premium'].includes(subscription?.plan?.name)) {
      throw new Error('Access restricted to Standard or Premium plans');
    }

    // Check credits
    const requiredCredits = CREDIT_COST[serviceType];
    if (subscription?.totalCredits < requiredCredits) {
      throw new Error('Not enough credits');
    }

    // Deduct credits
    subscription.totalCredits -= requiredCredits;
    await subscription.save();

    // Save subscription
    return VipSubscription.create({
      user: userId,
      serviceType,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month later
      active: true
    });
  } catch (err) {
    console.error("Error in subscribeToService:", err);
    throw new Error('Something went wrong while subscribing to the service' , err.message , err);
  }
};

const unsubscribe = async (userId, serviceType) => {
  try {
    const subscription = await VipSubscription.findOne({
      user: userId,
      serviceType,
      active: true
    });

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    subscription.active = false;
    subscription.unsubscribedAt = new Date();
    await subscription.save();
    return subscription;
  } catch (err) {
    console.error("Error in unsubscribe:", err);
    throw new Error('Something went wrong while unsubscribing');
  }
};
const getAllActiveSubscriptions = async () => {
  // Get all active VIP subscriptions : active , nextBillingDate < Date.now() and paymentStatus = 'PAID'
  try {
    return await VipSubscription.find({ active: true, nextBillingDate: { $gt: Date.now() }, paymentStatus: 'PAID' }).exec();
  } catch (err) {
    console.error("Error in getAllActiveSubscriptions:", err);
    throw new Error("Unable to retrieve active subscriptions.");
  }
}

const getSubscriptionByUserId = async (userId) => {
  try {
    return await VipSubscription.findOne({ user: userId });
  }
  catch (err) {
    console.error("Error in getSubscriptionByUserId:", err);
    throw new Error("Unable to retrieve subscription by user ID.");
  }
};

const getSubscriptionById = async (subscriptionId) => {
  try {
    return await VipSubscription.findById(subscriptionId);
  } catch (err) {
    console.error("Error in getSubscriptionById:", err);
    throw new Error("Unable to retrieve subscription by ID.");
  }
}

const getAllActiveSubscriptionsByServiceType = async (serviceType) => {
  try {
    return VipSubscription.find({ serviceType, active: true, nextBillingDate: { $gt: Date.now() }, paymentStatus: 'PAID' });
  } catch (err) {
    console.error("Error in getAllActiveSubscriptionsByServiceType:", err);
    throw new Error("Unable to retrieve active subscriptions by service type.");
  }

}

cron.schedule('0 0 * * *', async () => { // Every day at midnight
  const subscriptions = await getAllActiveSubscriptions();
  for (const subscription of subscriptions) {
    if (subscription.nextBillingDate <= new Date()) {
      // Logic to renew subscription, e.g., deduct credits, update nextBillingDate
      const user = await User.findById(subscription.user);
      if (!user) continue;
      const requiredCredits = CREDIT_COST[subscription.serviceType];
      const userSubscription = await Subscription.findOne({ user: user._id }).sort({ dateCreated: -1 });
      if (!userSubscription || userSubscription.totalCredits < requiredCredits) {
        // Not enough credits to renew : disable the subscription
        subscription.active = false;
        subscription.paymentStatus = 'FAILED';
        await subscription.save();
        continue;
      }
      userSubscription.totalCredits -= requiredCredits;
      await userSubscription.save();

      subscription.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Renew for another month
      subscription.subscribedAt = new Date();
      subscription.paymentStatus = 'PAID';
      subscription.active = true; // 

      await subscription.save();
    }
  }
});

module.exports = {
  subscribeToService, unsubscribe, getAllActiveSubscriptions, getSubscriptionByUserId,
  getSubscriptionById, getAllActiveSubscriptionsByServiceType
};

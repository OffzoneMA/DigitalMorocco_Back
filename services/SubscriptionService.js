const Subscription = require('../models/Subscription');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const SubscriptionLogService = require('../services/SubscriptionLogService');

const getSubscriptions = async () => {
    return await Subscription.find()
}

const dateInDays = days => new Date(Date.now() + days * 24 * 60 * 60 * 1000).getTime();

const dateIn1Month = () => dateInDays(30);

const dateIn1Year = () => dateInDays(365);

const getDateExpires = sub => sub.dateExpired || (sub.billing === 'year' ? dateIn1Year() : dateIn1Month());

const isSubscriptionActive = sub => sub.dateExpired > Date.now() && sub.dateStopped === undefined;

// Créer une nouvelle souscription pour un utilisateur
async function createSubscriptionForUser(userId, planId, data) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found.');
        }
        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) {
            throw new Error('Subscription Plan not found.');
        }

        const dateExpired = data.billing === 'year' ? dateIn1Year() : dateIn1Month();

        const newSubscription = await Subscription.create({
            ...data,
            user: userId,
            plan: planId,
            totalCredits: plan?.credits,
            dateExpired: dateExpired
        });

        const logData = {
            credits: plan?.credits,  
            totalCredits: plan?.credits,  
            subscriptionExpireDate: dateExpired,
            type: 'Initial Purchase',
            transactionId: 'TXN123456789', 
            notes: 'User subscribe to a new plan',
        };

        // Appel à la fonction pour créer un log de souscription
        await SubscriptionLogService.createSubscriptionLog(newSubscription._id, logData);

        return newSubscription;
    } catch (error) {
        throw new Error('Error creating subscription: ' + error.message);
    }
}

async function upgradeSubscription(subscriptionId, newPlanId , newBilling) {
    try {
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        const newPlan = await SubscriptionPlan.findById(newPlanId);
        if (!newPlan) {
            throw new Error('New subscription plan not found');
        }

        if (!isSubscriptionActive(subscription)) {
            throw new Error('Cannot upgrade an inactive subscription.');
        }

        subscription.plan = newPlanId;
        subscription.totalCredits += newPlan.credits;

        if (newBilling) {
            subscription.billing = newBilling;
        }

        // Mise à jour de la date d'expiration en fonction du nouveau type de facturation
        const newExpirationDate = newBilling === 'year' ? dateIn1Year() : dateIn1Month();
        subscription.dateExpired = newExpirationDate;

        // Créer un log de mise à niveau
        const logData = {
            credits: newPlan.credits,
            totalCredits: subscription.totalCredits,
            subscriptionExpireDate: subscription.dateExpired,
            type: 'Upgrade',
            transactionId: 'TXN234567890', 
            notes: `User upgraded to a higher plan and changed billing to ${newBilling}`,
        };
        await SubscriptionLogService.createSubscriptionLog(subscription._id, logData);

        await subscription.save();

        return subscription;
    } catch (error) {
        throw new Error('Error upgrading subscription: ' + error.message);
    }
}


const getSubscriptionById = async (id) => {
    return await Subscription.findById(id);
}

async function cancelSubscription(subscriptionId) {
    try {
        const subscription = await Subscription.findByIdAndUpdate(subscriptionId, {
            subscriptionStatus: 'cancelled',
            dateStopped: Date.now()
        });
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        const logData = {
            credits: subscription.totalCredits,
            totalCredits: subscription.totalCredits,
            subscriptionExpireDate: subscription.dateExpired,
            type: 'Cancel',
            transactionId: null, 
            notes: 'User cancelled the subscription',
        };
        await SubscriptionLogService.createSubscriptionLog(subscription._id, logData);

        return subscription;
    } catch (error) {
        throw new Error('Error cancelling subscription: ' + error.message);
    }
}

async function autoCancelExpiredSubscriptions() {
    try {
        const expiredSubscriptions = await Subscription.find({ dateExpired: { $lte: Date.now() }, subscriptionStatus: 'active' });
        const canceledSubscriptions = [];

        for (const subscription of expiredSubscriptions) {
            subscription.subscriptionStatus = 'cancelled';
            subscription.dateStopped = Date.now();

            // Créer un log d'annulation
            const logData = {
                credits: subscription.totalCredits,
                totalCredits: subscription.totalCredits,
                subscriptionExpireDate: subscription.dateExpired,
                type: 'Cancel',
                transactionId: null, 
                notes: 'Subscription automatically cancelled due to expiration',
            };
            await SubscriptionLogService.createSubscriptionLog(subscription._id, logData);

            await subscription.save();
            canceledSubscriptions.push(subscription);
        }

        return canceledSubscriptions;
    } catch (error) {
        throw new Error('Error auto-cancelling expired subscriptions: ' + error.message);
    }
}


// Suspend une souscription
async function pauseSubscription(subscriptionId) {
    try {
        const subscription = await Subscription.findByIdAndUpdate(subscriptionId, { subscriptionStatus: 'paused' });
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        const logData = {
            credits: subscription.totalCredits,
            totalCredits: subscription.totalCredits,
            subscriptionExpireDate: subscription.dateExpired,
            type: 'paused',
            transactionId: null, 
            notes: 'User paused the subscription',
        };
        await SubscriptionLogService.createSubscriptionLog(subscription._id, logData);

        return subscription;
    } catch (error) {
        throw new Error('Error pausing subscription: ' + error.message);
    }
}


async function addPaymentMethod(userId, paymentMethodType, paymentMethod, cardLastFourDigits, cardExpiration) {
    try {
        // Vérifier si l'utilisateur existe
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found.');
        }

        // Créer la souscription avec la méthode de paiement
        const newSubscription = await Subscription.create({
            user: userId,
            paymentMethodType: paymentMethodType,
            paymentMethod: paymentMethod,
            cardLastFourDigits: cardLastFourDigits,
            cardExpiration: cardExpiration
        });

        const logData = {
            type: 'Add Payment Method',
            transactionId: null, 
            notes: `User added a payment method: ${paymentMethodType}`,
        };
        await SubscriptionLogService.createSubscriptionLog(newSubscription._id, logData);

        return newSubscription;
    } catch (error) {
        throw new Error('Error adding payment method: ' + error.message);
    }
}

async function changePaymentMethod(subscriptionId, paymentMethodType, paymentMethod, cardLastFourDigits, cardExpiration) {
    try {
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        subscription.paymentMethodType = paymentMethodType;
        subscription.paymentMethod = paymentMethod;
        subscription.cardLastFourDigits = cardLastFourDigits;
        subscription.cardexpiration = cardExpiration;

        await subscription.save();

        const logData = {
            credits: subscription?.totalCredits,
            totalCredits: subscription?.totalCredits,
            subscriptionExpireDate: subscription?.dateExpired,
            type: 'Change Payment Method',
            transactionId: null, 
            notes: `User changed the payment method to: ${paymentMethodType}`,
        };
        await SubscriptionLogService.createSubscriptionLog(subscription._id, logData);

        return subscription;
    } catch (error) {
        throw new Error('Error changing payment method: ' + error.message);
    }
}

// Récupérer toutes les souscriptions pour un utilisateur spécifique
async function getSubscriptionsByUser(userId) {
    try {
        const subscriptions = await Subscription.find({ user: userId }).populate('plan');
        return subscriptions;
    } catch (error) {
        throw new Error('Error retrieving subscriptions for user: ' + error.message);
    }
}

async function renewSubscription(subscriptionId) {
    try {
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        if (!isSubscriptionActive(subscription)) {
            throw new Error('Subscription is not active, cannot renew.');
        }

        const plan = SubscriptionPlan.findById(subscription?.plan)
        if (!plan) {
            throw new Error('Subscription plan not found');
        }

        const newExpirationDate = subscription.billing === 'year' ? dateIn1Year() : dateIn1Month();
        subscription.dateExpired = newExpirationDate;

        // Créer un log de renouvellement
        const logData = {
            credits: plan.credits,
            totalCredits: subscription.credits + plan.credits,
            subscriptionExpireDate: newExpirationDate,
            type: 'Renew',
            transactionId: 'TXN987654321', 
            notes: 'User renewed the subscription',
        };
        await SubscriptionLogService.createSubscriptionLog(subscription._id, logData);

        await subscription.save();

        return subscription;
    } catch (error) {
        throw new Error('Error renewing subscription: ' + error.message);
    }
}


module.exports = {  createSubscriptionForUser,  upgradeSubscription,  getSubscriptionById,
    cancelSubscription,  autoCancelExpiredSubscriptions,  pauseSubscription,  addPaymentMethod,
    changePaymentMethod,  getSubscriptionsByUser,  renewSubscription,  dateInDays,  dateIn1Month,
    dateIn1Year,  getDateExpires}
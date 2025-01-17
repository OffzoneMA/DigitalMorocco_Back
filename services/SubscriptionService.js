const Subscription = require('../models/Subscription');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const SubscriptionLogService = require('../services/SubscriptionLogService');
const ActivityHistoryService = require('../services/ActivityHistoryService');
const EmailService = require('../services/EmailingService');
const i18n = require('i18next');


const languages = [
    { id: 'en', label: 'English' },
    { id: 'fr', label: 'French' },
    { id: 'fr', label: 'Français' },
    { id: 'es', label: 'Spanish' },
    { id: 'de', label: 'German' },
    { id: 'it', label: 'Italian' },
    { id: 'pt', label: 'Portuguese' },
    { id: 'ru', label: 'Russian' },
    { id: 'zh', label: 'Chinese' },
    { id: 'ja', label: 'Japanese' },
    { id: 'ko', label: 'Korean' },
    { id: 'ar', label: 'Arabic' },
    { id: 'hi', label: 'Hindi' },
    { id: 'tr', label: 'Turkish' },
    { id: 'nl', label: 'Dutch' },
    { id: 'pl', label: 'Polish' },
    { id: 'sv', label: 'Swedish' },
    { id: 'fi', label: 'Finnish' },
    { id: 'da', label: 'Danish' },
    { id: 'no', label: 'Norwegian' },
    { id: 'el', label: 'Greek' },
  ];
  
  function getLanguageIdByLabel(label) {
    const language = languages.find(lang => lang.label === label);
    return language ? language.id : null;
  }

  const formatDate = (timestamp, userLanguage) => {
    // Conversion du timestamp en objet Date
    const date = new Date(timestamp);
    
    // Définir la locale en fonction de la langue de l'utilisateur
    const locale = userLanguage === 'fr' ? 'fr-FR' : 
                   userLanguage === 'es' ? 'es-ES' : 
                   userLanguage === 'de' ? 'de-DE' : 'en-US';
    
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

const getSubscriptions = async () => {
    return await Subscription.find()
}

const dateInDays = days => new Date(Date.now() + days * 24 * 60 * 60 * 1000).getTime();

const dateIn1Month = () => dateInDays(31);

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

        const existingSubscription = await Subscription.findById(user.subscription);
        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) {
            throw new Error('Subscription Plan not found.');
        }

        const dateExpired = data.billing === 'year' ? dateIn1Year() : dateIn1Month();

        const newSubscription = await Subscription.create({
            ...data,
            user: userId,
            plan: plan?._id,
            totalCredits: plan?.credits + (existingSubscription?.totalCredits || 0),
            dateExpired: dateExpired
        });

        user.subscription = newSubscription._id;
        await user.save();

        // Préparation des données pour l'email
        const emailPlanDetails = {
            name: plan.name,
            price: plan.price,
            duration: data.billing === 'year' ? 12 : 1,
            features: plan.featureDescriptions,
        };

        // Envoi de l'email de bienvenue
        await EmailService.sendNewSubscriptionEmail(user._id , emailPlanDetails);


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
        await ActivityHistoryService.createActivityHistory(
            userId,
            'new_subscription',
            { targetName: `${plan.name}`, targetDesc: `User subscribed to plan ${planId}` }
        );
        return newSubscription;
    } catch (error) {
        console.log(error)
        throw new Error('Error creating subscription: ' + error.message);
    }
}
async function upgradeSubscription(subscriptionId, newPlanId , newBilling) {
    try {
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }
        const oldPlan = await SubscriptionPlan.findById(subscription.plan);

        const newPlan = await SubscriptionPlan.findById(newPlanId);
        if (!newPlan) {
            throw new Error('New subscription plan not found');
        }

        if (!isSubscriptionActive(subscription)) {
            throw new Error('Cannot upgrade an inactive subscription.');
        }

        const previousPlanName = oldPlan?.name;

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
         // Préparation des données pour l'email
         const emailPlanDetails = {
            name: newPlan.name,
            price: newPlan.price,
            duration: newBilling === 'year' ? 12 : 1,
            features: newPlan.featureDescriptions,
            previousPlan: previousPlanName,
            upgradeBenefits: newPlan.upgradeBenefits || []
        };

        await subscription.save();
        await EmailService.sendUpgradeEmail(subscription.user?._id , emailPlanDetails);
        await SubscriptionLogService.createSubscriptionLog(subscription._id, logData);
        await ActivityHistoryService.createActivityHistory(
            subscription.user,
            'subscription_upgraded',
            { targetName: `${newPlan?.name}`, targetDesc: `User upgraded to plan ${newPlanId}` }
        );

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
        const subscription = await Subscription.findByIdAndUpdate(
            subscriptionId,
            {
                subscriptionStatus: 'cancelled',
                dateStopped: Date.now(),
                isCanceled: true
            },
            { new: true }
        ).populate('plan');

        if (!subscription) {
            throw new Error('Subscription not found');
        }
        const user = await User.findById(subscription.user);
        // if (user) {
        //     user.subscription = null;
        //     await user.save();
        // }

        const logData = {
            credits: subscription.totalCredits,
            totalCredits: subscription.totalCredits,
            subscriptionExpireDate: subscription.dateExpired,
            type: 'Cancel',
            transactionId: null, 
            notes: 'User cancelled the subscription',
        };
        // Préparation des données pour l'email
        const emailPlanDetails = {
            name: subscription.plan.name,
            price: subscription.plan.price,
            duration: subscription.plan.billing === 'year' ? 12 : 1,
            features: subscription.plan.featureDescriptions,
        };

        // Envoi de l'email de bienvenue
        await EmailService.sendCancellationEmail(user._id , emailPlanDetails);
        await SubscriptionLogService.createSubscriptionLog(subscription._id, logData);
        await ActivityHistoryService.createActivityHistory(
            subscription.user,
            'subscription_canceled',
            { targetName: `${subscription?.plan?.name}`, targetDesc: `User canceled subscription ${subscriptionId}` }
        );
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
            subscription.isCanceled = true;
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
            await subscription.save();
            await SubscriptionLogService.createSubscriptionLog(subscription._id, logData);
            // await ActivityHistoryService.createActivityHistory(
            //     subscription.user,
            //     'subscription_auto_canceled',
            //     { targetName: `Subscription auto-canceled`, targetDesc: `Subscription ${subscription._id} auto-canceled due to expiration` }
            // );
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
        const subscription = await Subscription.findByIdAndUpdate(subscriptionId, { subscriptionStatus: 'paused' },
            { new: true }
        ).populate('plan');

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
        await ActivityHistoryService.createActivityHistory(
            subscription.user,
            'subscription_paused',
            { targetName: `${subscription?.plan?.name}`, targetDesc: `User paused subscription ${subscriptionId}` }
        );

        return subscription;
    } catch (error) {
        throw new Error('Error pausing subscription: ' + error.message);
    }
}

// Récupérer toutes les souscriptions pour un utilisateur spécifique
async function getSubscriptionsByUser(userId) {
    try {
        const subscription = await Subscription.findOne({
            user: userId,
            subscriptionStatus: 'active'
        })
        .sort({ dateCreated: -1 }) 
        .populate('plan'); 

        return subscription;
    } catch (error) {
        console.log(error);
        throw new Error('Error retrieving the most recent valid subscription for user: ' + error.message);
    }
}

async function searchSubscriptionsByUser(user, searchTerm) {
    try {
        const regex = new RegExp(searchTerm, 'i');

        const subscriptions = await Subscription.find({
            user: user?._id,
            subscriptionStatus: 'active', 
            $or: [
                { 'plan.name': regex },         
                { 'subscriptionStatus': regex },
                // { 'plan.description': regex },  
            ]
        })
        .sort({ dateCreated: -1 }) 
        .populate('plan');         
        return subscriptions;
    } catch (error) {
        console.log(error);
        throw new Error('Error searching subscriptions for user: ' + error.message);
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

        const plan = await SubscriptionPlan.findById(subscription?.plan)
        if (!plan) {
            throw new Error('Subscription plan not found');
        }

        const newExpirationDate = subscription.billing === 'year' ? dateIn1Year() : dateIn1Month();
        subscription.dateExpired = newExpirationDate;
        subscription.totalCredits = subscription.totalCredits + plan.credits;

        // Créer un log de renouvellement
        const logData = {
            credits: plan.credits,
            totalCredits: subscription.totalCredits + plan.credits,
            subscriptionExpireDate: newExpirationDate,
            type: 'Renew',
            transactionId: 'TXN987654321', 
            notes: 'User renewed the subscription',
        };

        await subscription.save();

        const user = await User.findById(subscription.user);
        if (user) {
            user.subscription = subscription._id; 
            await user.save();
        }

        const userLanguage = getLanguageIdByLabel(user?.language);

        // Préparation des données pour l'email
        const emailPlanDetails = {
            name: plan.name,
            price: plan.price,
            duration: subscription.billing === 'year' ? 12 : 1,
            features: plan.featureDescriptions,
            renewalDate: formatDate(newExpirationDate, userLanguage),
        };

        await EmailService.sendRenewalEmail(subscription.user?._id , emailPlanDetails);

        await SubscriptionLogService.createSubscriptionLog(subscription._id, logData);
        await ActivityHistoryService.createActivityHistory(
            subscription.user,
            'subscription_renew',
            { targetName: `Subscription renewed`, targetDesc: `User renewed subscription ${subscriptionId}` }
        );
        return subscription;
    } catch (error) {
        console.log(error)
        throw new Error('Error renewing subscription: ' + error.message);
    }
}

async function checkUserSubscription(userId) {
    try {
        const subscription = await Subscription.findOne({
            user: userId,
            subscriptionStatus: 'active',
            dateExpired: { $gt: new Date() }  // Vérifie que la date d'expiration est dans le futur
        }).populate('plan');
        
        return subscription ? true : false;
    } catch (error) {
        throw new Error('Error checking subscription: ' + error.message);
    }
}

async function updateSubscription(subscriptionId, updateData) {
    try {
        const subscription = await Subscription.findByIdAndUpdate(subscriptionId, updateData);
        if (!subscription) {
            throw new Error('Subscription not found');
        }
        return subscription;
    } catch (error) {
        throw new Error('Error updating subscription: ' + error.message);
    }
}

async function deleteSubscription(subscriptionId) {
    try {
        const subscription = await Subscription.findByIdAndDelete(subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }
        return subscription;
    } catch (error) {
        throw new Error('Error deleting subscription: ' + error.message);
    }
}


module.exports = {  createSubscriptionForUser,  upgradeSubscription,  getSubscriptionById,
    cancelSubscription,  autoCancelExpiredSubscriptions,  pauseSubscription,  getSubscriptionsByUser,  renewSubscription,  dateInDays,  dateIn1Month,
    dateIn1Year,  getDateExpires , checkUserSubscription , getSubscriptions , updateSubscription , 
    deleteSubscription , searchSubscriptionsByUser
};
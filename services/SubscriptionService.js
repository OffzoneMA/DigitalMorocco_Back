const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Project = require('../models/Project');
const Member = require('../models/Member');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const SubscriptionLogService = require('../services/SubscriptionLogService');
const PaiementService = require('./PaiementService');
const ActivityHistoryService = require('../services/ActivityHistoryService');
const EmailService = require('../services/EmailingService');
const InvestorAccessLogService = require('../services/InvestorAccessLogService');
const i18n = require('i18next');
const axios = require('axios');
const MemberService = require('../services/MemberService');

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

async function convertCurrency1(amount, from = 'USD', to = 'MAD') {
    try {
        const response = await axios.get(`https://latest.currency-api.pages.dev/v1/currencies/${from.toLowerCase()}.json`);
        const rate = response.data[from.toLowerCase()][to.toLowerCase()];
        return amount * rate;
    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function convertCurrency2(amount) {
    try {
        const response = await axios.get('https://v6.exchangerate-api.com/v6/e1289ff884515590e0ad3027/latest/USD');
        const rate = response?.data?.conversion_rates?.MAD;
        return (amount * rate).toFixed(2); // Retourne le montant converti avec 2 décimales
    } catch (error) {
        console.error('Erreur API:', error.message);
        return null;
    }
}

async function convertUSDtoMAD(amount) {
    // Première tentative
    try {
        const result1 = await convertCurrency1(amount, 'USD', 'MAD');

        return parseFloat(result1.toFixed(2));
    } catch (error1) {
        console.log('❌ API principale échouée, tentative avec l\'API de secours...');
        
        // Deuxième tentative
        try {
            const result2 = await convertCurrency2(amount);
            console.log('✅ Succès avec l\'API de secours');
            return result2;
        } catch (error2) {
            console.error('❌ Les deux APIs ont échoué');
            console.error('Erreur API 1:', error1.message);
            console.error('Erreur API 2:', error2.message);
            return null;
        }
    }
}

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

const isSubscriptionActive = sub => sub.dateExpired > Date.now();

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

        //Date d'expiration de la souscription
        const dateExpired = plan?.price <=0 ? dateIn1Year() : (data.billing === 'year' ? dateIn1Year() : dateIn1Month());

        const isFreePlan = plan.price <= 0;
        const newCredits = plan.credits + (existingSubscription?.totalCredits || 0);

        const subscriptionPayload = {
            ...data,
            user: userId,
            plan: plan._id,
            totalCredits: isFreePlan ? newCredits : (existingSubscription?.totalCredits || 0),
            dateExpired: dateExpired,
        };

        // Cas d’un plan gratuit (sans paiement)
        if (isFreePlan) {
            const newSubscription = await Subscription.create({
                ...subscriptionPayload,
                subscriptionStatus: 'active',
            });

            user.subscription = newSubscription._id;
            await user.save();

            const emailPlanDetails = {
                name: plan.name,
                price: plan.price,
                duration: data.billing === 'year' ? 12 : 1,
                features: plan.featureDescriptions,
            };

            await EmailService.sendNewSubscriptionEmail(user._id, emailPlanDetails, user.language);

            const logData = {
                credits: plan.credits,
                totalCredits: newCredits,
                subscriptionExpireDate: dateExpired,
                type: 'Initial Purchase',
                transactionId: 'FREE_PLAN',
                notes: 'User subscribed to a free plan',
            };

            await SubscriptionLogService.createSubscriptionLog(newSubscription._id, logData);
            await ActivityHistoryService.createActivityHistory(
                userId,
                'new_subscription',
                { targetName: `${plan.name}`, targetDesc: `User subscribed to free plan ${planId}` }
            );

            return {
                success: true,
                isPaymentSessionCreated: false,
                data: newSubscription,
            };
        } else {
            // Cas d’un plan payant (on prépare l’upgrade différé)
            const newSubscription = await Subscription.create({
                ...subscriptionPayload,
                pendingUpgrade: {
                    newPlan: plan._id,
                    newCredits: plan.credits,
                    previousPlanName: existingSubscription?.planName || '',
                    newPlanName: plan.name,
                    newBilling: data.billing,
                    newExpirationDate: dateExpired,
                    price: plan.price,
                    currency: 'USD',
                },
            });
            const convertedPrice = await convertUSDtoMAD(plan.price);
            // Générer la session de paiement
            const paymentSession = await PaiementService.generatePaymentSession({
                name: plan.name,
                price: convertedPrice,
                displayPrice: plan.price,
                customerId: userId,
                subscriptionId: newSubscription._id,
                language: user?.language ? getLanguageIdByLabel(user.language) : 'en',
                type: 'new',
                metadata: {
                    name: user.displayName || `${user.firstName} ${user.lastName}`,
                    email: user.email,
                },
            });

            return {
                success: true,
                isPaymentSessionCreated: true,
                data: paymentSession,
            };
        }
        
    } catch (error) {
        console.error(error);
        throw new Error('Error creating subscription: ' + error.message);
    }
}


async function upgradeSubscription(subscriptionId, newPlanId, newBilling) {
    try {
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found.');
        }

        // if (!isSubscriptionActive(subscription)) {
        //     throw new Error('Cannot upgrade an inactive subscription.');
        // }

        const oldPlan = await SubscriptionPlan.findById(subscription.plan);
        const newPlan = await SubscriptionPlan.findById(newPlanId);

        if (!newPlan) {
            throw new Error('New subscription plan not found.');
        }

        // Ne pas upgrader vers le même plan
        if (oldPlan._id.equals(newPlan._id)) {
            throw new Error('You are already subscribed to this plan.');
        }

        // Interdire upgrade vers un plan gratuit (inutile)
        if (newPlan.price <= 0) {
            throw new Error('Cannot upgrade to a free plan.');
        }

        const user = await User.findById(subscription.user);
        if (!user) {
            throw new Error('User not found.');
        }

        const newExpirationDate = newBilling === 'year' ? dateIn1Year() : dateIn1Month();

        subscription.pendingUpgrade = {
            newPlan: newPlan._id,
            newCredits: newPlan.credits,
            previousPlanName: oldPlan.name,
            newPlanName: newPlan.name,
            newBilling,
            newExpirationDate,
            price: newPlan.price,
            currency: 'USD'
        };

        if((oldPlan.price > newPlan.price) && user?.role?.toLowerCase() == 'member') {

            const member = await MemberService.getMemberByUserId(user._id);

            const totalProjects = await MemberService.getAllProjectsForMemberWithoutPagination(member._id , {});
            const totalMaskedProjects = totalProjects.filter(p => p.mask);

            subscription.previousPlanInfo = {
                planName: oldPlan.name,
                isDowngrade: true ,
                userRole: user?.role,
                totalProjects: totalProjects?.length || 0,
                totalMaskedProjects: totalMaskedProjects?.length || 0
            };
        }

        await subscription.save();
        const convertedPrice = await convertUSDtoMAD(newPlan.price);
        const paymentSession = await PaiementService.generatePaymentSession({
            name: newPlan.name,
            price: convertedPrice,
            displayPrice: newPlan.price,
            currency: 'MAD',
            customerId: user._id,
            subscriptionId: subscription._id,
            language: user.language ? getLanguageIdByLabel(user.language) : 'en',
            type: 'upgrade',
            metadata: {
                name: user.displayName || `${user.firstName} ${user.lastName}`,
                email: user.email
            }
        });

        return {
            success: true,
            data: paymentSession,
            isPaymentSessionCreated: true,
        };

    } catch (error) {
        console.error(error);
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
            endDate: formatDate(subscription.dateExpired, user.language),
        };

        // Supprimer tous les access log de l'utilisateur 
        await InvestorAccessLogService.deleteAccessLogsByUser(user._id);

        // Envoi de l'email de bienvenue
        await EmailService.sendCancellationEmail(user._id, emailPlanDetails);
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
            await InvestorAccessLogService.deleteAccessLogsByUser(subscription?.user);
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

        // if (!isSubscriptionActive(subscription)) {
        //     throw new Error('Subscription is not active, cannot renew.');
        // }

        const plan = await SubscriptionPlan.findById(subscription.plan);
        if (!plan) {
            throw new Error('Subscription plan not found');
        }

        if (plan.price <= 0) {
            throw new Error('Cannot renew a free subscription plan.');
        }

        const newExpirationDate = subscription.billing === 'year' ? dateIn1Year() : dateIn1Month();

        subscription.pendingUpgrade = {
            newPlan: plan._id,
            newCredits: plan.credits,
            previousPlanName: plan.name,
            newPlanName: plan.name,
            newBilling: subscription.billing,
            newExpirationDate,
            price: plan.price,
            currency: 'USD',
        };

        await subscription.save();

        const user = await User.findById(subscription.user);
        const userLanguage = getLanguageIdByLabel(user?.language) || 'en';
        const convertedPrice = await convertUSDtoMAD(plan.price);
        const paymentSession = await PaiementService.generatePaymentSession({
            name: plan.name,
            price: convertedPrice,
            displayPrice: plan.price,
            customerId: subscription.user,
            subscriptionId: subscription._id,
            language: userLanguage,
            type: 'renew',
            metadata: {
                name: user?.displayName || `${user?.firstName} ${user?.lastName}`,
                email: user?.email,
            },
        });

        return {
            success: true,
            data: paymentSession,
            isPaymentSessionCreated: true,
        };
    } catch (error) {
        console.error('Error renewing subscription:', error);
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

async function achatCredits(userId, data) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const subscription = await Subscription.findOne({ user: userId, subscriptionStatus: 'active' }).sort({ dateCreated: -1 });
        if (!subscription) {
            throw new Error('No active subscription found for this user');
        }

        subscription.pendingUpgrade.newCredits = data?.credits;
        subscription.pendingUpgrade.price = data?.price;
        subscription.pendingUpgrade.currency = 'USD';


        await subscription.save();
        const convertUsdToMad = await convertUSDtoMAD(data?.price);
        // Process the payment
        const paymentSession = await PaiementService.generatePaymentSessionForCredits({
            name: 'Credits-Purchase',
            price: convertUsdToMad,
            displayPrice: data?.price,
            customerId: userId,
            subscriptionId: subscription?._id,
            type: 'achat-credits',
            language: user?.language ? getLanguageIdByLabel(user?.language) : 'en',
            metadata: {
                name: user?.displayName ? user?.displayName : user?.firstName + ' ' + user?.lastName,
                email: user?.email
            }
        });

        return {
            success: true,
            data: paymentSession,
        };
    }
    catch (error) {
        console.log('error', error)
        throw new Error('Error purchasing credits: ' + error.message);
    }
}

async function deductionCredits(userId , credits , serviceType) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const subscription = await Subscription.findOne({ user: userId, subscriptionStatus: 'active' }).sort({ dateCreated: -1 });
        if (!subscription) {
            throw new Error('No active subscription found for this user');
        }

        if (subscription.totalCredits < credits) {
            throw new Error('Insufficient credits');
        }

        subscription.totalCredits -= credits;
        await subscription.save({ new: true });

        if(serviceType === 'ADD_PROJECT') {
            // Ajouter le projet draft à l'utilisateur
            const member = await Member.findOne({ owner: userId });
            if (!member) {
                throw new Error('Member not found for the user');
            }
            // Créer un projet avec le statut 'draft'
            await Project.create({
                owner: member._id,
                name: 'Draft Project',
                status: 'Draft',
            });
        } 

        if(serviceType === "ACCESS_INVESTORS") {
            // Log access 
            await InvestorAccessLogService.logAccess(userId , true);
        }

        return {
            success: true,
            message: `Successfully deducted ${credits} credits from user ${userId}. Remaining credits: ${subscription.totalCredits}`,
            subscription: subscription
        };
    } catch (error) {
        console.error('Error deducting credits:', error);
        throw new Error('Error deducting credits: ' + error);
    }
    
}

module.exports = {
    createSubscriptionForUser, upgradeSubscription, getSubscriptionById,
    cancelSubscription, autoCancelExpiredSubscriptions, pauseSubscription, getSubscriptionsByUser, renewSubscription, dateInDays, dateIn1Month,
    dateIn1Year, getDateExpires, checkUserSubscription, getSubscriptions, updateSubscription,
    deleteSubscription, searchSubscriptionsByUser, formatDate, getLanguageIdByLabel, achatCredits , deductionCredits
};
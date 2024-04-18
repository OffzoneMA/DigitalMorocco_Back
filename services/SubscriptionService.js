const Subscription = require('../models/Subscription');

const getSubscriptions = async () => {
    return await Subscription.find()
}

const dateInDays = days => new Date(Date.now() + days * 24 * 60 * 60 * 1000).getTime();

const dateIn1Month = () => dateInDays(31);

const dateIn1Year = () => dateInDays(366);

const getDateExpires = sub => sub.dateExpired || (sub.billing === 'year' ? dateIn1Year() : dateIn1Month());

const isSubscriptionActive = sub => sub.dateExpired > Date.now() && sub.dateStopped === undefined;


const getSubscriptionById = async (id) => {
    return await Subscription.findById(id);
}

async function cancelSubscription(subscriptionId) {
    try {
        const subscription = await Subscription.findByIdAndUpdate(subscriptionId, { subscriptionStatus: 'cancelled' });
        return subscription;
    } catch (error) {
        throw new Error('Error cancelling subscription: ' + error.message);
    }
}

async function pauseSubscription(subscriptionId) {
    try {
        const subscription = await Subscription.findByIdAndUpdate(subscriptionId, { subscriptionStatus: 'paused' });
        return subscription;
    } catch (error) {
        throw new Error('Error pausing subscription: ' + error.message);
    }
}

async function addPaymentMethod( paymentMethodType, paymentMethod, cardLastFourDigits, cardExpiration) {
    try {
        const newSubscription = await Subscription.create({
            paymentMethodType: paymentMethodType,
            paymentMethod: paymentMethod,
            cardLastFourDigits: cardLastFourDigits,
            cardExpiration: cardExpiration
        });

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

        return subscription;
    } catch (error) {
        throw new Error('Error changing payment method: ' + error.message);
    }
}

module.exports = { getSubscriptions, getSubscriptionById ,dateInDays, 
    dateIn1Month, dateIn1Year, getDateExpires, isSubscriptionActive , 
    cancelSubscription, pauseSubscription,addPaymentMethod , changePaymentMethod}
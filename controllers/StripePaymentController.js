const SubscriptionService = require('../services/SubscriptionService');
const SubscriptionLogService = require('../services/SubscriptionLogService');
const ActivityHistoryService = require('../services/ActivityHistoryService');
const PaymentMethodService = require('../services/PaymentMethodService');
const UserService = require('../services/UserService');
const SubscriptionPlanService = require('../services/SubscriptionPlanService');
const UserLogService = require('../services/UserLogService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');

const createPaymentIntent = async (req, res) => {
    const { amount, currency, paymentMethodId, subscriptionId , userId } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method: paymentMethodId,
            confirm: true,
            confirmation_method: 'manual',
            customer: req.user.stripeCustomerId,
            off_session: true,
            confirm: true,
            payment_method_types: ['card'],
            setup_future_usage: 'off_session',
            description: 'Payment for subscription',
            metadata: {
                subscriptionId: subscriptionId,
                userId: req.user._id,
            },
        });
        res.status(200).json(paymentIntent); // Return client secret
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const processCreditCardPayment = async (req, res) => {
    const { paymentMethodId, subscriptionId } = req.body;
    try {
        const paymentMethod = await PaymentMethodService.getPaymentMethodById(paymentMethodId);
        if (!paymentMethod) {
            throw new Error('Payment method not found.');
        }
        const subscription = await SubscriptionService.getSubscriptionById(subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found.');
        }
        const paymentResult = await stripe.paymentIntents.create({
            amount: subscription.amount,
            currency: 'usd',
            payment_method: paymentMethod.stripePaymentMethodId,
            confirm: true,
            confirmation_method: 'manual',
            customer: req.user.stripeCustomerId,
            off_session: true,
            confirm: true,
            payment_method_types: ['card'],
            setup_future_usage: 'off_session',
            description: 'Payment for subscription',
            metadata: {
                subscriptionId: subscriptionId,
                userId: req.user._id,
            },
        });
        if (paymentResult.status === 'succeeded') {
            const logData = {
                credits: subscription.totalCredits,
                totalCredits: subscription.totalCredits,
                subscriptionExpireDate: subscription.dateExpired,
                type: 'Payment',
                transactionId: paymentResult.id,
                notes: 'User made a payment for their subscription',
            };
            await SubscriptionLogService.createSubscriptionLog(subscriptionId, logData); // Create a log for the payment
            await ActivityHistoryService.createActivityHistory(
                req.user._id,
                'payment',
                { targetName: `Subscription ${subscriptionId}`, targetDesc: `User made a payment for their subscription` }
            );
            res.status(200).json({ success: true, message: 'Payment successful' });
        } else {
            res.status(500).json({ success: false, message: 'Payment failed' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const processPayPalPayment = async (req, res) => {
    const { paymentMethodId, subscriptionId } = req.body;
    try {
        const paymentMethod = await PaymentMethodService.getPaymentMethodById(paymentMethodId);
        if (!paymentMethod) {
            throw new Error('Payment method not found.');
        }
        const subscription = await SubscriptionService.getSubscriptionById(subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found.');
        }
        const paymentData = {
            intent: 'sale',
            payer: {
                payment_method: 'paypal',
            },
            transactions: [
                {
                    amount: {
                        total: subscription.amount,
                        currency: 'USD',
                    },
                },
            ],
            redirect_urls: {
                return_url: `${process.env.FRONTEND_URL}/payment/success`,
                cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
            },
        };
        const paymentResult = await paypal.payment.create(paymentData);
        if (paymentResult) {
            const logData = {
                credits: subscription.totalCredits,
                totalCredits: subscription.totalCredits,
                subscriptionExpireDate: subscription.dateExpired,
                type: 'Payment',
                transactionId: paymentResult.id,
                notes: 'User made a payment for their subscription',
            };
            await SubscriptionLogService.createSubscriptionLog(subscriptionId, logData); // Create a log for the payment
            await ActivityHistoryService.createActivityHistory(
                req.user._id,
                'payment',
                { targetName: `Subscription ${subscriptionId}`, targetDesc: `User made a payment for their subscription` }
            );
            res.status(200).json({ success: true, message: 'Payment successful' });
        } else {
            res.status(500).json({ success: false, message: 'Payment failed' }); 
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const processGooglePayPayment = async (req, res) => {
    const { paymentMethodId, subscriptionId } = req.body;
    try {
        const paymentMethod = await PaymentMethodService.getPaymentMethodById(paymentMethodId);
        if (!paymentMethod) {
            throw new Error('Payment method not found.');
        }
        const subscription = await SubscriptionService.getSubscriptionById(subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found.');
        }
        const paymentResult = await stripe.paymentIntents.create({
            amount: subscription.amount,
            currency: 'usd',
            payment_method: paymentMethod.stripePaymentMethodId,
            confirm: true,
            description: `Subscription payment for user ${subscription.user}`, 
        });
        if (paymentResult.status === 'succeeded') {
            const logData = {
                credits: subscription.totalCredits,
                totalCredits: subscription.totalCredits,
                subscriptionExpireDate: subscription.dateExpired,
                type: 'Payment',
                transactionId: paymentResult.id,
                notes: 'User made a payment for their subscription',
            }; 
            await SubscriptionLogService.createSubscriptionLog(subscriptionId, logData); // Create a log for the payment
            await ActivityHistoryService.createActivityHistory(
                req.user._id,
                'payment',
                { targetName: `Subscription ${subscriptionId}`, targetDesc: `User made a payment for their subscription` }
            );
            res.status(200).json({ success: true, message: 'Payment successful' });
        } else {
            res.status(500).json({ success: false, message: 'Payment failed' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const processApplePayPayment = async (req, res) => {
    const { paymentMethodId, subscriptionId } = req.body;
    try {
        const paymentMethod = await PaymentMethodService.getPaymentMethodById(paymentMethodId);
        if (!paymentMethod) {
            throw new Error('Payment method not found.');
        }
        const subscription = await SubscriptionService.getSubscriptionById(subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found.');
        }
        const paymentResult = await stripe.paymentIntents.create({
            amount: subscription.amount,
            currency: 'usd',
            payment_method: paymentMethod.stripePaymentMethodId,
            confirm: true,
            description: `Subscription payment for user ${subscription.user}`, 
        });
        if (paymentResult.status === 'succeeded') {
            const logData = {
                credits: subscription.totalCredits,
                totalCredits: subscription.totalCredits,
                subscriptionExpireDate: subscription.dateExpired,
                type: 'Payment',
                transactionId: paymentResult.id,
                notes: 'User made a payment for their subscription', 
            };
            await SubscriptionLogService.createSubscriptionLog(subscriptionId, logData); // Create a log for the payment
            await ActivityHistoryService.createActivityHistory(
                req.user._id,
                'payment',
                { targetName: `Subscription ${subscriptionId}`, targetDesc: `User made a payment for their subscription` }
            );
            res.status(200).json({ success: true, message: 'Payment successful' });
        } else {
            res.status(500).json({ success: false, message: 'Payment failed' });
        } 
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    processStripePayment,
    processPayPalPayment,
    processGooglePayPayment,
    processApplePayPayment,
};


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');
const PaymentMethodService = require('../services/PaymentMethodService');
const SubscriptionService = require('../services/SubscriptionService');
const SubscriptionLogService = require('../services/SubscriptionLogService');
const SubscriptionPlanService = require('../services/SubscriptionPlanService');
const ActivityHistoryService = require('../services/ActivityHistoryService');
const paypal = require('paypal-rest-sdk');

paypal.configure({
    mode: 'sandbox', // or 'live'
    client_id: 'your_paypal_client_id',
    client_secret: 'your_paypal_client_secret'
});


// async function processCreditCardPayment(paymentMethod , subscription ){
//     try {
//         const amount = await calculateAmount(subscription);
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: amount,
//             currency: 'usd',
//             payment_method_types: ['card'],
//             source: paymentMethod.cardNumber, // Use a tokenized source in production
//             description: `Subscription payment for user ${subscription.user}`,
//         });
//         return paymentIntent; 
//     } catch (error) {
//         throw error;
//     }
// }

const processCreditCardPayment = async (paymenttoken, subscription) => {
    try {
        const amount = await calculateAmount(subscription);

        const paymentResult = await stripe.charges.create({
            amount: amount,
            currency: 'usd',
            source: paymenttoken, 
            description: `Subscription payment for user ${subscription.user}`,
        });

        return { success: paymentResult.paid, message: paymentResult.outcome.seller_message };
    } catch (error) {
        console.error('Error processing credit card payment:', error);
        return { success: false, message: error.message };
    }
}

const processPayPalPayment = async (subscription) => {
    try {
        const amount = await calculateAmount(subscription);

        const paymentData = {
            intent: 'sale',
            payer: {
                payment_method: 'paypal',
            },
            transactions: [{
                amount: {
                    total: (amount).toFixed(2), 
                    currency: 'USD',
                },
                description: `Subscription payment for user ${subscription.user}`
            }],
            redirect_urls: {
                return_url: 'https://localhost:3000/api/paypal/success',
                cancel_url: 'https://localhost:3000/api/paypal/cancel',
            }
        }

        return new Promise((resolve, reject) => {
            paypal.payment.create(paymentData, (error, payment) => {
                if (error) {
                    console.error('Error processing PayPal payment:', error);
                    reject({ success: false, message: error.message });
                } else {
                    resolve({ success: true, message: 'PayPal payment processed successfully', payment });
                }
            });
        });
    } catch (error) {
        console.error('Error processing PayPal payment:', error);
        return { success: false, message: error.message };
    }
}

const processGooglePayPayment = async (paymenttoken, subscription) => {
    try {
        const amount = await calculateAmount(subscription);

        const paymentResult = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method: paymenttoken, // Google Pay token
            confirm: true,
            description: `Subscription payment for user ${subscription.user}`,
        });

        return { success: paymentResult.status === 'succeeded', message: paymentResult.status };
    } catch (error) {
        console.error('Error processing Google Pay payment:', error);
        return { success: false, message: error.message };
    }
}

const processApplePayPayment = async (paymenttoken, subscription) => {
    try {
        const amount = await calculateAmount(subscription);

        const paymentResult = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method: paymenttoken, // Apple Pay token
            confirm: true,
            description: `Subscription payment for user ${subscription.user}`,
        });

        return { success: paymentResult.status === 'succeeded', message: paymentResult.status };
    } catch (error) {
        console.error('Error processing Apple Pay payment:', error);
        return { success: false, message: error.message };
    }
}

const calculateAmount = async (subscription) => {
    const plan = await SubscriptionPlanService.getSubscriptionPlanById(subscription.plan);

    if (!plan) {
        throw new Error('Subscription plan not found');
    }

    let amount;

    if (subscription.billing === 'year') {
        const discountedPrice = plan.annualPrice * (1 - plan.annualDiscountRate / 100);
        amount = Math.round(discountedPrice );
    } else {
        // Use monthly pricing
        amount = Math.round(plan.price); 
    }

    return amount;
}

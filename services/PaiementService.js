const crypto = require('crypto');
const payzoneConfig = require('../config/payement_config');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Transaction = require('../models/Transaction');
const SubscriptionLogService = require('./SubscriptionLogService');
const ActivityHistoryService = require('./ActivityHistoryService');
const User = require('../models/User');
const EmailingService = require('./EmailingService');
const axios = require('axios');
const { subscribe } = require('diagnostics_channel');

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

const dateInDays = days => new Date(Date.now() + days * 24 * 60 * 60 * 1000).getTime();

const dateIn1Month = () => dateInDays(31);

const dateIn1Year = () => dateInDays(365);

/**
 * Generate HMAC signature for Payzone API calls
 * @param {string} path - API relative path including query params
 * @param {string|object} body - Request body (optional)
 * @returns {Object} - Headers with signature and timestamp
 */
const generateHmacSignature = (path, body = '') => {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyContent = typeof body === 'object' ? JSON.stringify(body) : (body || '');

  const message = `${payzoneConfig.callerName}${payzoneConfig.merchantAccount}${timestamp}${path}${bodyContent}`;

  const signature = crypto
    .createHmac('sha256', payzoneConfig.callerPassword)
    .update(message)
    .digest('hex');

  return {
    signature,
    timestamp
  };
};

/**
 * Validate an incoming HMAC signature
 * @param {string} receivedSignature - The signature to validate
 * @param {string} timestamp - The timestamp from the request
 * @param {string} path - The request path
 * @param {string|object} body - The request body
 * @returns {boolean} - Whether the signature is valid
 */
const validateHmacSignature = (receivedSignature, timestamp, path, body = '') => {
  const bodyContent = typeof body === 'object' ? JSON.stringify(body) : (body || '');

  const message = `${payzoneConfig.callerName}${payzoneConfig.merchantAccount}${timestamp}${path}${bodyContent}`;

  const calculatedSignature = crypto
    .createHmac('sha256', payzoneConfig.callerPassword)
    .update(message)
    .digest('hex');

  return receivedSignature === calculatedSignature;
};

/**
 * Generate paywall signature for client-side form submission
 * @param {string} payload - JSON payload string
 * @returns {string} - SHA-256 signature
 */
const generatePaywallSignature = (payload) => {
  return crypto
    .createHash('sha256')
    .update(payzoneConfig.paywallSecretKey + payload)
    .digest('hex');
};

/**
 * Verify callback signature from payment gateway
 * @param {string} rawBody - Raw request body
 * @param {string} receivedSignature - Signature received in headers
 * @returns {boolean} - Whether signature is valid
 */
const verifyCallbackSignature = (rawBody, receivedSignature) => {
  const expectedSignature = crypto
    .createHmac('sha256', payzoneConfig.notificationKey)
    .update(rawBody)
    .digest('hex');

  return receivedSignature &&
    expectedSignature.toLowerCase() === receivedSignature.toLowerCase();
};

/**
 * Create headers for Payzone API requests
 * @param {string} path - API path (without base URL)
 * @param {object|null} body - Request body (if applicable)
 * @returns {object} - Headers object
 */
const createPayzoneHeaders = (path, body = null) => {
  const { signature, timestamp } = generateHmacSignature(path, body);

  return {
    'X-MerchantAccount': payzoneConfig.merchantAccount,
    'X-CallerName': payzoneConfig.callerName,
    'X-HMAC-Timestamp': timestamp,
    'X-HMAC-Signature': signature,
    'Content-Type': 'application/json'
  };
};

/**
 * Make an HTTP request to Payzone API
 * @param {string} method - HTTP method (GET, POST)
 * @param {string} path - API path (without base URL)
 * @param {object|null} data - Request body (for POST requests)
 * @returns {Promise<object>} - API response
 */
const payzoneApiRequest = async (method, path, data = null) => {
  try {
    const headers = createPayzoneHeaders(path, data);
    const url = `${payzoneConfig.apiBaseUrl}${path}`;

    const response = await axios({
      method,
      url,
      headers,
      data
    });

    return response.data;
  } catch (error) {
    console.error('Payzone API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'API request failed');
  }
};


/**
   * Generate payment session for paywall redirect
   * @param {object} paymentDetails - Payment details
   * @returns {object} - Payment session details
   */
const generatePaymentSession = async (paymentDetails) => {
  const { name, price, displayPrice, customerId, subscriptionId, language, type, metadata = {} } = paymentDetails;

  // Current timestamp for unique identifiers
  const timestamp = Math.floor(Date.now() / 1000);

  // Build payload
  const payload = {
    // Authentication parameters
    merchantAccount: payzoneConfig.merchantAccount,
    timestamp: timestamp,
    skin: 'vps-1-vue',

    // Customer parameters
    customerId: customerId || `user_${timestamp}`,
    customerCountry: 'MA',
    customerName: metadata?.name || 'User',
    customerEmail: metadata?.email || '',
    customerLocale: language === 'fr' ? 'fr_FR' : 'en_US',

    // Charge parameters
    chargeId: subscriptionId ? `${subscriptionId}_${timestamp}` : `charge_${timestamp}`,
    orderId: `${name}_plan_${type}_${timestamp}`,
    price: price !== 0 ? price.toString() : '1',
    currency: 'MAD',
    displayPrice: displayPrice,
    displayCurrency: 'USD',
    description: 'User Subscription Payment',

    // Deep linking
    mode: 'DEEP_LINK',
    paymentMethod: 'CREDIT_CARD',
    showPaymentProfiles: 'false',

    // URLs
    callbackUrl: payzoneConfig.callbackUrl,
    successUrl: payzoneConfig.successUrl,
    failureUrl: payzoneConfig.failureUrl,
    cancelUrl: payzoneConfig.cancelUrl,
  };

  // Generate signature
  const jsonPayload = JSON.stringify(payload);
  const signature = generatePaywallSignature(jsonPayload);

  return {
    paywallUrl: payzoneConfig.paywallUrl,
    payload: jsonPayload,
    signature
  };

  // const res = await payzoneApiRequest('POST', '/api/v3/charges', payload);

  // const charge = res.data;

  // console.log('Charge response:', charge);
  // res.redirect(charge.redirectUrl);
};

const generatePaymentSessionForCredits = async (paymentDetails) => {
  const { name, price, displayPrice, customerId, subscriptionId, type, language, metadata = {} } = paymentDetails;

  // Current timestamp for unique identifiers
  const timestamp = Math.floor(Date.now() / 1000);

  // Build payload
  const payload = {
    // Authentication parameters
    merchantAccount: payzoneConfig.merchantAccount,
    timestamp: timestamp,
    skin: 'vps-1-vue',

    // Customer parameters
    customerId: customerId || `user_${timestamp}`,
    // customerCountry: 'US',
    customerName: metadata?.name || 'User',
    customerEmail: metadata?.email || '',
    customerLocale: language === 'fr' ? 'fr_FR' : 'en_US',

    // Charge parameters
    chargeId: subscriptionId ? `${subscriptionId}_${timestamp}` : `charge_${timestamp}`,
    orderId: `${name}_plan_${type}_${timestamp}`,
    price: price !== 0 ? price.toString() : '1',
    currency: 'MAD',
    displayPrice: displayPrice,
    displayCurrency: 'USD',
    description: 'User Credits Purchase',

    // Deep linking
    mode: 'DEEP_LINK',
    paymentMethod: 'CREDIT_CARD',
    showPaymentProfiles: 'false',

    // URLs
    callbackUrl: payzoneConfig.callbackUrl,
    successUrl: payzoneConfig.successCreditsUrl,
    failureUrl: payzoneConfig.failureCreditsUrl,
    cancelUrl: payzoneConfig.cancelCreditsUrl,
  };

  // Generate signature
  const jsonPayload = JSON.stringify(payload);
  const signature = generatePaywallSignature(jsonPayload);

  return {
    paywallUrl: payzoneConfig.paywallUrl,
    payload: jsonPayload,
    signature
  };

  // const res = await payzoneApiRequest('POST', '/api/v3/charges', payload);

  // const charge = res.data;

  // console.log('Charge response:', charge);
  // res.redirect(charge.redirectUrl);
};

const toValidNumber = (val) => {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

/**
 * Process payment callback data
 * @param {object} data - Payment callback data
 * @returns {object} - Processing result
 */
const processPaymentCallback = async (data) => {

  if (data.status === 'CHARGED') {
    // Find approved transaction
    const transaction = data.transactions.find(t => t.state === 'APPROVED');

    if (transaction && transaction.resultCode === 0) {
      // 1. Update database with payment confirmation
      const [subscriptionId, timestamporder] = data.id.split('_');
      const subscription = await Subscription.findById(subscriptionId);
      const [planName, planText, type, timestamp] = data.orderId.split('_');

      if (!subscription) {
        console.error('Subscription not found for transaction:', data.id);
        return {
          success: false,
          message: 'Subscription not found'
        };
      }
      const plan = await SubscriptionPlan.findById(subscription.plan);
      if (!plan) {
        console.error('Plan not found for subscription:', subscription._id);
        return {
          success: false,
          message: 'Plan not found'
        };
      }
      const user = await User.findById(subscription.user);
      const userLanguage = getLanguageIdByLabel(user?.language);

      if (!user) {
        console.error('User not found for subscription:', subscription.user);
        return {
          success: false,
          message: 'User not found'
        };
      }

      const transactionData = {
        transactionId: data.id,
        internalId: data.internalId,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: data.status,
        paymentType: data.paymentType,
        paymentMethod: data.paymentMethod,
        state: transaction.state,
        responseText: transaction.responseText,
        userId: subscription.user,
        subscriptionId: subscription._id,
        metadata: {
          subscribeType: type,
          timestamp: transaction.timestamp,
        }
      };

      const existingTransaction = await Transaction.findOne({ transactionId: data.id });
      if (!existingTransaction) {
        const transactionRecord = await Transaction.create(transactionData);
        if (transactionRecord) {
          subscription.transactions.push(transactionRecord._id);
        }
      }

      subscription.subscriptionStatus = 'active';

      // 2. Send confirmation email
      const emailData = {
        name: plan?.name,
        price: plan?.price,
        duration: subscription?.billing === 'year' ? 12 : 1,
        features: plan.featureDescriptions
      }

      const logData = {}

      switch (type) {
        case 'new':
          const pendingUpgrade = subscription.pendingUpgrade;
          subscription.totalCredits = pendingUpgrade
            ? toValidNumber(pendingUpgrade.newCredits) + subscription.totalCredits
            : toValidNumber(subscription.totalCredits);
          user.subscription = subscription._id;
          subscription.pendingUpgrade = null;
          await user.save();
          await subscription.save();

          // Créer un log de mise à niveau
          logData.credits = plan.credits;
          logData.totalCredits = subscription.totalCredits + toValidNumber(plan.credits);
          logData.subscriptionExpireDate = subscription.billing === 'year' ? dateIn1Year() : dateIn1Month();
          logData.type = 'Initial Purchase';
          logData.notes = `User subscribed to new plan ${planName}`;

          await SubscriptionLogService.createSubscriptionLog(subscription._id, logData);

          await ActivityHistoryService.createActivityHistory(
            user._id,
            'new_subscription',
            { targetName: `${plan.name}`, targetDesc: `User subscribed to plan ${plan._id}` }
          );

          await EmailingService.sendNewSubscriptionEmail(user._id, emailData);
          break;

        case 'upgrade':
          const { newPlan, newCredits, previousPlanName, newPlanName, newBilling, newExpirationDate } = subscription.pendingUpgrade;

          const upgradePlan = await SubscriptionPlan.findById(newPlan);
          subscription.plan = upgradePlan._id ? upgradePlan._id : subscription.plan;
          subscription.totalCredits = subscription.totalCredits + toValidNumber(newCredits);
          subscription.billing = newBilling;
          subscription.dateExpired = newExpirationDate ? newExpirationDate : newBilling === 'year' ? dateIn1Year() : dateIn1Month();
          subscription.pendingUpgrade = null;

          await subscription.save();

          emailData.upgradeBenefits = upgradePlan?.featureDescriptions || plan.featureDescriptions || [];
          emailData.previousPlan = previousPlanName;

          logData.credits = plan.credits;
          logData.totalCredits = subscription.totalCredits + toValidNumber(newCredits);
          logData.subscriptionExpireDate = newExpirationDate;
          logData.type = 'Upgrade';
          logData.notes = `User upgraded to a higher plan and changed billing to ${newBilling}`;

          await SubscriptionLogService.createSubscriptionLog(subscription._id, logData);
          await ActivityHistoryService.createActivityHistory(
            subscription.user,
            'subscription_upgraded',
            { targetName: `${newPlanName}`, targetDesc: `User upgraded to plan ${newPlan}` }
          );
          await EmailingService.sendUpgradeEmail(user._id, emailData);
          break;

        case 'renew':

          const subscriptionPendingUpgrade = subscription.pendingUpgrade;
          emailData.renewalDate = formatDate(subscriptionPendingUpgrade.newExpirationDate, userLanguage);

          subscription.plan = subscriptionPendingUpgrade.newPlan;
          subscription.totalCredits += toValidNumber(subscriptionPendingUpgrade.newCredits);
          subscription.billing = subscriptionPendingUpgrade.newBilling;
          subscription.dateExpired = subscriptionPendingUpgrade.newExpirationDate ? subscriptionPendingUpgrade.newExpirationDate : subscriptionPendingUpgrade.newBilling === 'year' ? dateIn1Year() : dateIn1Month();
          subscription.pendingUpgrade = null;

          const savedSubscription = await subscription.save({ new: true });

          // Créer un log de renouvellement
          logData.credits = plan.credits;
          logData.totalCredits = savedSubscription?.totalCredits;
          logData.subscriptionExpireDate = savedSubscription.dateExpired;
          logData.type = 'Renew';
          logData.transactionId = data.id;
          logData.notes = 'User renewed the subscription';

          await SubscriptionLogService.createSubscriptionLog(subscription._id, logData);
          await ActivityHistoryService.createActivityHistory(
            subscription.user,
            'subscription_renew',
            { targetName: `Subscription renewed`, targetDesc: `User renewed subscription ${subscriptionId}` }
          );

          emailData.renewalDate = formatDate(subscription.dateExpired, userLanguage);
          await EmailingService.sendRenewalEmail(user._id, emailData);
          break;

        case 'achat-credits':
          const pendingcredits = subscription?.pendingUpgrade;
          subscription.totalCredits = subscription.totalCredits + toValidNumber(pendingcredits.newCredits);
          subscription.dateExpired = dateIn1Month();
          subscription.pendingUpgrade = null;

          const updatedSub = await subscription.save({ new: true });

          logData.credits = pendingcredits?.newCredits;
          logData.totalCredits = updatedSub.totalCredits;
          logData.subscriptionExpireDate = updatedSub.dateExpired;
          logData.type = 'Purchase Credits';
          logData.notes = `User purchased ${updatedSub?.totalCredits} credits`;

          await SubscriptionLogService.createSubscriptionLog(updatedSub?._id, logData);

          await ActivityHistoryService.createActivityHistory(
            user._id,
            'purchase_credits',
            { targetName: `${pendingcredits.newCredits}`, targetDesc: `User purchased ${updatedSub?.totalCredits} credits` }
          );

          // await EmailingService.sendPurchaseCreditsEmail(user._id, emailData);
          break;
      }

      return {
        success: true,
        message: 'Payment processed successfully',
        transactionId: data.id,
        data: subscription,
      };
    }
  } else if (data.status === 'DECLINED') {
    // Handle declined payment
    const declinedTransaction = data.transactions.find(t => t.state === 'DECLINED');

    if (declinedTransaction) {
      // 1. Update database with payment status
      const [subscriptionId, timestamporder] = data.id.split('_');
      const [planName, planText, type, timestamp] = data.orderId.split('_');

      const subscription = await Subscription.findById(subscriptionId);

      if (!subscription) {
        console.error('Subscription not found for transaction:', data.id);
        return {
          success: false,
          message: 'Subscription not found'
        };
      }
      const transactionData = {
        transactionId: data.id,
        internalId: data.internalId,
        type: declinedTransaction.type,
        amount: declinedTransaction.amount,
        currency: declinedTransaction.currency,
        status: data.status,
        paymentType: data.paymentType,
        paymentMethod: data.paymentMethod,
        state: declinedTransaction.state,
        responseText: declinedTransaction.responseText,
        userId: subscription.user,
        subscriptionId: subscription._id,
        dateCreated: new Date(),
        metadata: {
          subscribeType: type,
          timestamp: declinedTransaction.timestamp,
        }
      };

      const existingTransaction = await Transaction.findOne({ transactionId: data.id });

      if (!existingTransaction) {
        // Create a new transaction record
        const transactionRecord = await Transaction.create(transactionData);

        if (transactionRecord) {
          subscription.transactions.push(transactionRecord._id);
        }
      }

      await subscription.save();
    }

    return {
      success: false,
      message: 'Payment was declined',
      status: data.status
    };

  } else {
    return {
      success: false,
      message: 'Payment was not successful',
      status: data.status
    };
  }
};

/**
   * Check if Payzone API is healthy
   * @returns {Promise<object>} - Health check response
   */
const checkApiHealth = async () => {
  return await payzoneApiRequest('GET', '/api/v3/healthcheck');
};

/**
 * Get transaction details by ID
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<object>} - Transaction details
 */
const getTransaction = async (transactionId) => {
  return await payzoneApiRequest('GET', `/api/v3/charges/${transactionId}`);
};

/**
   * Capture an authorized transaction
   * @param {string} transactionId - Transaction ID
   * @param {number|null} amount - Amount to capture (optional)
   * @returns {Promise<object>} - Capture response
   */
const captureTransaction = async (transactionId, amount = null) => {
  const payload = {
    command: 'SETTLE'
  };

  if (amount !== null) {
    payload.amount = amount;
  }

  return await payzoneApiRequest('POST', `/api/v3/charges/${transactionId}`, payload);
};

/**
   * Cancel an authorized transaction
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<object>} - Cancellation response
   */
const cancelTransaction = async (transactionId) => {
  const payload = {
    command: 'AUTH_REVERSAL'
  };

  return await payzoneApiRequest('POST', `/api/v3/charges/${transactionId}`, payload);
};

/**
 * Refund a settled transaction
 * @param {string} transactionId - Transaction ID
 * @param {number|null} amount - Amount to refund (optional)
 * @returns {Promise<object>} - Refund response
 */
const refundTransaction = async (transactionId, amount = null) => {
  const payload = {
    command: 'REFUND'
  };

  if (amount !== null) {
    payload.amount = amount;
  }

  return await payzoneApiRequest('POST', `/api/v3/charges/${transactionId}`, payload);
};

module.exports = {
  generateHmacSignature,
  validateHmacSignature,
  generatePaywallSignature,
  verifyCallbackSignature,
  createPayzoneHeaders,
  payzoneApiRequest,
  generatePaymentSession,
  processPaymentCallback,
  checkApiHealth,
  getTransaction,
  captureTransaction,
  cancelTransaction,
  refundTransaction,
  generatePaymentSessionForCredits
};
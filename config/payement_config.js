// This file contains the configuration for the payment gateway.
const paymentConfig = {
    merchantAccount : 'Digitalmorocco_Test',
    paywallSecretKey : 'jQUG1Hncv1CKwskb',
    callerName: process.env.PAYZONE_CALLER_NAME || '$caller',
    callerPassword: process.env.PAYZONE_CALLER_PASSWORD || '123456',
    paywallUrl : 'https://payment-sandbox.payzone.ma/pwthree/launch',
    notificationKey : 'RVGMUbA2OIbfp82p',
    skin: "vps-1-vue",
    customerCountry : 'MA',
    mode : 'DEEP_LINK',	// fixed value				
    paymentMethod : 'CREDIT_CARD' ,	// fixed value
    callbackUrl : `${process.env.BACKEND_URL}/payment/callback`,
    successUrl : `${process.env.FRONTEND_URL}/Subscription?statuspaid=success`,
    successCreditsUrl: `${process.env.FRONTEND_URL}/ManageCredits?statuspaid=success`,
    failureUrl : `${process.env.FRONTEND_URL}/Subscription?statuspaid=failed`,
    failureCreditsUrl: `${process.env.FRONTEND_URL}/ManageCredits?statuspaid=failed`,
    pendingUrl : `${process.env.FRONTEND_URL}/Subscription?statuspaid=cancelled`,
    cancelUrl : `${process.env.FRONTEND_URL}/Subscription`,	
    // successUrl : `${process.env.BACKEND_URL}/payment/return?status=AUTHORISED`,
    // failureUrl : `${process.env.BACKEND_URL}/payment/return?status=DECLINED`,
    // cancelUrl  : `${process.env.BACKEND_URL}/payment/return?status=CANCELLED`,
    cancelCreditsUrl: `${process.env.FRONTEND_URL}/ManageCredits`,
    apiBaseUrl: 'https://payment-sandbox.payzone.ma',
  };
  
  module.exports = paymentConfig;
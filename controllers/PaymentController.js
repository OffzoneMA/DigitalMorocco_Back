const PaiementService = require('../services/PaiementService');
/**
   * Create payment session for frontend redirection
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
const createPaymentSession = async (req, res) => {
  try {
    const { name, price, currency, customerId, subscriptionId, language, type, metadata = {} } = req.body;

    if (!price) {
      return res.status(400).json({
        success: false,
        message: 'Price is required'
      });
    }

    const paymentSession = await PaiementService.generatePaymentSession({
      name,
      price,
      currency,
      customerId,
      subscriptionId,
      language,
      type,
      metadata
    });

    res.status(200).json({
      success: true,
      data: paymentSession
    });
  } catch (error) {
    console.error('Payment session creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment session'
    });
  }
};

/**
 * Handle callback from payment gateway
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const handlePaymentCallback = async (req, res) => {
  try {
    // Get raw request body and signature
    const rawBody = req.rawBody;
    const receivedSignature = req.headers['x-callback-signature'];

    // Verify signature
    const isValidSignature = PaiementService.verifyCallbackSignature(rawBody, receivedSignature);

    if (!isValidSignature) {

      return res.status(403).json({
        status: 'KO',
        message: 'Error signature'
      });
    }

    // Process payment data
    const callbackData = JSON.parse(rawBody);
    const result = await PaiementService.processPaymentCallback(callbackData);

    if (result.success) {

      return res.status(200).json({
        status: 'OK',
        message: 'Status recorded successfully'
      });
    } else {

      return res.status(200).json({
        status: 'KO',
        message: 'Status not recorded successfully'
      });
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(200).json({
      status: 'KO',
      message: 'Internal server error'
    });
  }
};

/**
   * Check Payzone API health
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
const checkHealth = async (req, res) => {
  try {
    const healthStatus = await PaiementService.checkApiHealth();
    res.status(200).json({
      success: true,
      data: healthStatus
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check API health'
    });
  }
};

/**
   * Get transaction details
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
const getTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    const transactionData = await PaiementService.getTransaction(transactionId);

    res.status(200).json({
      success: true,
      data: transactionData
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction details'
    });
  }
};

/**
   * Capture a transaction
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
const captureTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { amount } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    const captureResult = await PaiementService.captureTransaction(
      transactionId,
      amount || null
    );

    res.status(200).json({
      success: true,
      data: captureResult
    });
  } catch (error) {
    console.error('Capture transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to capture transaction'
    });
  }
};

/**
   * Cancel a transaction
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
const cancelTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    const cancelResult = await PaiementService.cancelTransaction(transactionId);

    res.status(200).json({
      success: true,
      data: cancelResult
    });
  } catch (error) {
    console.error('Cancel transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel transaction'
    });
  }
};

/**
 * Refund a transaction
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const refundTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { amount } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    const refundResult = await PaiementService.refundTransaction(
      transactionId,
      amount || null
    );

    res.status(200).json({
      success: true,
      data: refundResult
    });
  } catch (error) {
    console.error('Refund transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refund transaction'
    });
  }
};

// backend/controllers/PaymentController.js
const handlePaymentReturn = async (req, res) => {
  try {
    const { status, orderId } = req.query;

    // Exemple : status peut être "AUTHORISED", "DECLINED", "CANCELLED"
    if (status === 'AUTHORISED') {
      return res.redirect(`${process.env.FRONTEND_URL}/Subscription?statuspaid=success`);
    } else if (status === 'DECLINED') {
      return res.redirect(`${process.env.FRONTEND_URL}/Subscription?statuspaid=failed`);
    } else {
      return res.redirect(`${process.env.FRONTEND_URL}/Subscription?statuspaid=cancelled`);
    }
  } catch (error) {
    console.error('Payment return error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/Subscription?statuspaid=error`);
  }
};


module.exports = {
  createPaymentSession,
  handlePaymentCallback,
  checkHealth,
  getTransaction,
  captureTransaction,
  cancelTransaction,
  refundTransaction,
  handlePaymentReturn
};
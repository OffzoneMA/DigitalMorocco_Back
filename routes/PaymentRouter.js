const express = require("express");
const router = express.Router();

const PaymentController = require("../controllers/PaymentController");
const rawBodyMiddleware = require("../middelware/rawBodyMiddleware");

// Health check route
router.get('/health', PaymentController.checkHealth);

router.post('/callback', PaymentController.handlePaymentCallback);

// Create payment session
router.post('/create-session', PaymentController.createPaymentSession);

// Transaction endpoints
router.get('/:transactionId', PaymentController.getTransaction);
router.post('/:transactionId/capture', PaymentController.captureTransaction);
router.post('/:transactionId/cancel', PaymentController.cancelTransaction);
router.post('/:transactionId/refund', PaymentController.refundTransaction);


module.exports = router;

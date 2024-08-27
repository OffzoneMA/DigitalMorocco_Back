const PaymentMethodController  = require('../controllers/PaymentMethodController');
const AuthController = require('../controllers/AuthController');
const router = require('express').Router();

/**
 * @swagger
 * tags:
 *   name: PaymentMethode
 *   description: API for managing payment methods
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentMethod:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The ID of the payment method
 *         userId:
 *           type: string
 *           description: The ID of the user
 *         paymentMethodType:
 *           type: string
 *           description: The type of payment method
 *         paymentMethod:
 *           type: string
 *           description: The payment method
 *         cardName:
 *           type: string
 *           description: The name on the card
 *         cardNumber:
 *           type: string
 *           description: The card number
 *         expiryDate: 
 *           type: string
 *           description: The expiry date of the card
 *         cvv:
 *           type: string
 *           description: The cvv of the card
 */

/**
 * @swagger
 * /payment-methods:
 *   get:
 *     summary: Get all payment methods for a user
 *     tags: [Payment Methods]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns all payment methods for a user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PaymentMethod'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get('/', AuthController.AuthenticateUser, PaymentMethodController.getPaymentMethods);

/**
 * @swagger
 * /payment-methods/last:
 * get:
 *    summary: Get the last payment method for a user
 *    tags: [Payment Methods]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: Returns the last payment method for a user
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/PaymentMethod'
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Internal Server Error
 */
router.get('/last', AuthController.AuthenticateUser, PaymentMethodController.getLastPaiementMethod);

/**
 * @swagger
 * /payment-methods/{paymentMethodeId}:
 * get:
 *    summary: Get a payment method by ID
 *    tags: [Payment Methods]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: paymentMethodId
 *        schema:
 *          type: string
 *        required: true
 *        description: ID of the payment method to get
 *    responses:
 *      200:
 *        description: Returns the payment method
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/PaymentMethod'
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Internal Server Error
 */
router.get('/:paymentMethodId', PaymentMethodController.getPaymentMethodById);

/**
 * @swagger
 * /payment-methods:
 *   post:
 *     summary: Add a new payment method for a user
 *     tags: [Payment Methods]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentMethod'
 *     responses:
 *       201:
 *         description: Returns the newly created payment method
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentMethod'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post('/', AuthController.AuthenticateUser, PaymentMethodController.addPaymentMethod);

/**
 * @swagger
 * /payment-methods/{paymentMethodId}:
 *   put:
 *     summary: Update a payment method for a user
 *     tags: [Payment Methods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentMethodId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the payment method to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentMethod'
 *     responses:
 *       200:
 *         description: Returns the updated payment method
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentMethod'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.put('/:paymentMethodId', AuthController.AuthenticateUser, PaymentMethodController.updatePaymentMethod);

/**
 * @swagger
 * /payment-methods/{paymentMethodId}:
 *   delete:
 *     summary: Delete a payment method for a user
 *     tags: [Payment Methods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentMethodId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the payment method to delete
 *     responses:
 *       204:
 *         description: Payment method deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:paymentMethodId', AuthController.AuthenticateUser, PaymentMethodController.deletePaymentMethod);

module.exports = router;
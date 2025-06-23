const express = require("express")
const router = express.Router()
const SubscriptionController = require("../controllers/SubscriptionController")
const AuthController = require("../controllers/AuthController")

/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: API for managing subscriptions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Subscription:
 *       type: object
 *       properties:
 *         plan:
 *           type: string
 *           format: uuid
 *           description: ID de l'abonnement
 *         user:
 *           type: string
 *           format: uuid
 *           description: ID de l'utilisateur
 *         billing:
 *           type: string
 *           example: 'month'
 *           description: Type de facturation
 *         paymentMethodType:
 *           type: string
 *           example: 'Card'
 *           description: Type de méthode de paiement
 *         paymentMethod:
 *           type: string
 *           description: Détails de la méthode de paiement
 *         cardLastFourDigits:
 *           type: integer
 *           description: Derniers 4 chiffres de la carte de crédit
 *         cardexpiration:
 *           type: string
 *           description: Date d'expiration de la carte de crédit
 *         subscriptionStatus:
 *           type: string
 *           enum:
 *             - active
 *             - cancelled
 *             - paused
 *             - notActive
 *           default: notActive
 *           description: Statut de l'abonnement
 *         autoRenew:
 *           type: boolean
 *           default: true
 *           description: Indique si l'abonnement se renouvelle automatiquement
 *         nextBillingDate:
 *           type: string
 *           format: date
 *           description: Date de la prochaine facturation
 *         dateCreated:
 *           type: string
 *           format: date-time
 *           default: "current date and time"
 *           description: Date de création de l'abonnement
 *         dateExpired:
 *           type: string
 *           format: date-time
 *           description: Date d'expiration de l'abonnement
 *         dateStopped:
 *           type: string
 *           format: date-time
 *           description: Date à laquelle l'abonnement a été arrêté
 *         discountCode:
 *           type: string
 *           description: Code de réduction appliqué à l'abonnement
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *           description: Données supplémentaires associées à l'abonnement
 */

/**
 * @swagger
 * /subscriptions:
 *   get:
 *     summary: Retrieve all subscriptions
 *     tags: [Subscription]
 *     responses:
 *       200:
 *         description: List of subscriptions
 *       500:
 *         description: Server error
 */
router.get('/', SubscriptionController.getSubscriptions);

/**
 * @swagger
 * /subscriptions/forUser:
 *   get:
 *     summary: Get subscription for a specific user
 *     tags: [Subscription]
 *     responses:
 *       200:
 *         description: User subscription
 *       500:
 *         description: Server error
 */
router.get('/forUser', AuthController.AuthenticateUser, SubscriptionController.getSubscriptionsByUser);


/**
 * @swagger
 * /subscriptions/user/plan/{planId}:
 *   post:
 *     summary: Create a new subscription for a user
 *     tags: [Subscription]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subscription'
 *     responses:
 *       201:
 *         description: Subscription created
 *       500:
 *         description: Server error
 */
router.post('/user/plan/:planId',AuthController.AuthenticateUser, SubscriptionController.createSubscriptionForUser);

/**
 * @swagger
 * /subscriptions/achat-credits:
 *   post:
 *     summary: Purchase credits for a user
 *     tags: [Subscription]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *             credits:
 *              type: number
 *             price:
 *              type: number
 *     responses:
 *       201:
 *         description: Credits purchased
 *       500:
 *         description: Server error
 */
router.post('/achat-credits', AuthController.AuthenticateUser, SubscriptionController.achatCredits);

/**
 * @swagger
 * /subscriptions/{subscriptionId}/upgrade:
 *   post:
 *     summary: Upgrade a subscription
 *     tags: [Subscription]
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subscriptionId:
 *                 type: string
 *               newPlanId:
 *                 type: string
 *               newBilling:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscription upgraded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       500:
 *         description: Internal server error
 */
router.post('/:subscriptionId/upgrade', SubscriptionController.upgradeSubscription);

/**
 * @swagger
 * /subscriptions/{id}:
 *   get:
 *     summary: Get a subscription by ID
 *     tags: [Subscription]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription data
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Server error
 */
router.get('/:id', SubscriptionController.getSubscriptionById);

/**
 * @swagger
 * /subscriptions/{id}/cancel:
 *   patch:
 *     summary: Cancel a subscription
 *     tags: [Subscription]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription cancelled
 *       500:
 *         description: Server error
 */
router.patch('/:id/cancel', SubscriptionController.cancelSubscription);

/**
 * @swagger
 * /subscriptions/auto-cancel:
 *   post:
 *     summary: Auto-cancel expired subscriptions
 *     responses:
 *       200:
 *         description: List of cancelled subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscription'
 *       500:
 *         description: Internal server error
 */
router.post('/auto-cancel', SubscriptionController.autoCancelExpiredSubscriptions);

/**
 * @swagger
 * /subscriptions/{id}/pause:
 *   patch:
 *     summary: Pause a subscription
 *     tags: [Subscription]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription paused
 *       500:
 *         description: Server error
 */
router.patch('/:id/pause', SubscriptionController.pauseSubscription);

/**
 * @swagger
 * /subscriptions/{subscriptionId}/renew:
 *   post:
 *     summary: Renew a subscription
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the subscription
 *     responses:
 *       200:
 *         description: Subscription renewed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       500:
 *         description: Internal server error
 */
router.post('/:subscriptionId/renew', SubscriptionController.renewSubscription);

/**
 * @swagger
 * /subscriptions/{id}:
 *   put:
 *     summary: Update a subscription by ID
 *     tags: [Subscription]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The subscription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subscription'
 *     responses:
 *       200:
 *         description: The updated subscription.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       404:
 *         description: Subscription not found
 */
router.put('/:id', SubscriptionController.updateSubscription);

/**
 * @swagger
 * /subscriptions/{id}:
 *   delete:
 *     summary: Delete a subscription by ID
 *     tags: [Subscription]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The subscription ID
 *     responses:
 *       200:
 *         description: Subscription deleted successfully.
 *       404:
 *         description: Subscription not found
 */
router.delete('/:id', SubscriptionController.deleteSubscription);

module.exports = router
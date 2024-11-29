const express = require("express")
const router = express.Router()
const SubscriptionLogController = require("../controllers/SubscriptionLogController")
const AuthController = require("../controllers/AuthController")

/**
 * @swagger
 * tags:
 *   name: SubscriptionLogs
 *   description: API for managing subscription logs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SubscriptionLog:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *           format: uuid
 *           description: ID de l'utilisateur
 *         subscriptionId:
 *           type: string
 *           format: uuid
 *           description: ID de l'abonnement
 *         subscriptionDate:
 *           type: string
 *           format: date-time
 *           description: Date de l'abonnement
 *         credits:
 *           type: number
 *           description: Nombre de crédits associés
 *         totalCredits:
 *           type: number
 *           description: Nombre total de crédits associés
 *         subscriptionExpireDate:
 *           type: string
 *           format: date-time
 *           description: Date d'expiration de l'abonnement
 *         type:
 *           type: string
 *           enum: ['Renew', 'Initial Purchase', 'Cancel', 'Upgrade']
 *           description: Type d'action sur l'abonnement
 *         transactionId:
 *           type: string
 *           description: Identifiant de la transaction de paiement
 *         notes:
 *           type: string
 *           description: Commentaires ou notes supplémentaires
 */


/**
 * @swagger
 * /subscription-logs:
 *   get:
 *     summary: Get a list of subscription logs
 *     tags: [SubscriptionLogs]
 *     responses:
 *       200:
 *         description: List of subscription logs
 *       500:
 *         description: Internal server error
 */
router.get('/', SubscriptionLogController.listSubscriptionLogs);

/**
 * @swagger
 * /subscription-logs:
 *   post:
 *     summary: Create a new subscription log
 *     tags: [SubscriptionLogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubscriptionLog'
 *     responses:
 *       201:
 *         description: Subscription log created
 *       500:
 *         description: Internal server error
 */
router.post('/', SubscriptionLogController.addSubscriptionLog);

/**
 * @swagger
 * /subscription-logs/{id}:
 *   get:
 *     summary: Get a subscription log by ID
 *     tags: [SubscriptionLogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Subscription log found
 *       404:
 *         description: Subscription log not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', SubscriptionLogController.getSubscriptionLog);

/**
 * @swagger
 * /subscription-logs/{id}:
 *   put:
 *     summary: Update a subscription log by ID
 *     tags: [SubscriptionLogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubscriptionLog'
 *     responses:
 *       200:
 *         description: Subscription log updated
 *       404:
 *         description: Subscription log not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', SubscriptionLogController.modifySubscriptionLog);

/**
 * @swagger
 * /subscription-logs/{id}:
 *   delete:
 *     summary: Delete a subscription log by ID
 *     tags: [SubscriptionLogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Subscription log deleted
 *       404:
 *         description: Subscription log not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', SubscriptionLogController.removeSubscriptionLog);


router.route("/").get(AuthController.AuthenticateAdmin, SubscriptionLogController.getAllLogs)
router.route("/byUser").get(AuthController.AuthenticateUser, SubscriptionLogController.getAllLogsByUser)



module.exports = router
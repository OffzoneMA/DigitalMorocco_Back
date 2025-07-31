const express = require('express');
const router = express.Router();
const VipSubscriptionController = require('../controllers/VipSubscriptionController');

/**
 * @swagger
 * tags:
 *   name: VIP Subscriptions
 *   description: Gestion des abonnements VIP
 */

/**
 * @swagger
 * /vip-subscription/subscribe:
 *   post:
 *     summary: S’abonner à un service VIP
 *     tags: [VIP Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Abonnement créé avec succès.
 *       500:
 *         description: Erreur serveur.
 */
router.post('/subscribe', VipSubscriptionController.subscribeToVip);

/**
 * @swagger
 * /vip-subscription/unsubscribe:
 *   post:
 *     summary: Se désabonner d’un service VIP
 *     tags: [VIP Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Désabonnement réussi.
 *       500:
 *         description: Erreur serveur.
 */
router.post('/unsubscribe', VipSubscriptionController.unsubscribeFromVip);

/**
 * @swagger
 * /vip-subscription/active:
 *   get:
 *     summary: Récupérer tous les abonnements VIP actifs
 *     tags: [VIP Subscriptions]
 *     responses:
 *       200:
 *         description: Liste des abonnements actifs.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/active', VipSubscriptionController.getAllActiveSubscriptions);

/**
 * @swagger
 * /vip-subscription/user:
 *   get:
 *     summary: Récupérer l’abonnement VIP actif de l’utilisateur courant
 *     tags: [VIP Subscriptions]
 *     responses:
 *       200:
 *         description: Abonnement trouvé.
 *       404:
 *         description: Aucun abonnement trouvé.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/user', VipSubscriptionController.getSubscriptionByUserId);

/**
 * @swagger
 * /vip-subscription/{subscriptionId}:
 *   get:
 *     summary: Récupérer un abonnement par ID
 *     tags: [VIP Subscriptions]
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Abonnement trouvé.
 *       404:
 *         description: Abonnement non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/:subscriptionId', VipSubscriptionController.getSubscriptionById);

/**
 * @swagger
 * /vip-subscription/service/{serviceType}:
 *   get:
 *     summary: Récupérer tous les abonnements VIP actifs pour un service donné
 *     tags: [VIP Subscriptions]
 *     parameters:
 *       - in: path
 *         name: serviceType
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des abonnements actifs.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/service/:serviceType', VipSubscriptionController.getAllActiveSubscriptionsByServiceType);

/**
 * @swagger
 * /vip-subscription/service/{serviceType}/user:
 *   get:
 *     summary: Récupérer les abonnements actifs d’un utilisateur courant pour un service donné
 *     tags: [VIP Subscriptions]
 *     parameters:
 *       - in: path
 *         name: serviceType
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Abonnements de l’utilisateur.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/service/:serviceType/user', VipSubscriptionController.getAllActiveSubscriptionsByServiceTypeAndUser);

/**
 * @swagger
 * /vip-subscription/service/{serviceType}/user/{userId}:
 *   get:
 *     summary: Récupérer les abonnements actifs d’un utilisateur donné pour un service
 *     tags: [VIP Subscriptions]
 *     parameters:
 *       - in: path
 *         name: serviceType
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Abonnements de l’utilisateur.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/service/:serviceType/user/:userId', VipSubscriptionController.getAllActiveSubscriptionsByServiceTypeAndUserId);

module.exports = router;

// routes/newsletterRoutes.js

const express = require('express');
const router = express.Router();
const NewsletterController = require('../controllers/NewsletterController');

/**
 * @swagger
 * /newsletter/subscribe:
 *   post:
 *     summary: S'abonner à la newsletter
 *     tags: [NewsLetter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de l'utilisateur
 *     responses:
 *       '201':
 *         description: Inscription réussie à la newsletter
 *       '400':
 *         description: Erreur lors de l'inscription à la newsletter
 */
router.post('/subscribe', NewsletterController.subscribe);

/**
 * @swagger
 * /newsletter/unsubscribe:
 *   post:
 *     summary: Se désabonner de la newslette
 *     tags: [NewsLetter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de l'utilisateur
 *     responses:
 *       '200':
 *         description: Désinscription réussie de la newsletter
 *       '400':
 *         description: Erreur lors de la désinscription de la newsletter
 */
router.post('/unsubscribe', NewsletterController.unsubscribe);

/**
 * @swagger
 * /newsletter/subscribers:
 *   get:
 *     summary: Récupérer la liste de tous les abonnés
 *     tags: [NewsLetter]
 *     parameters:
 *       - in: query
 *         name: subscribed
 *         schema:
 *           type: boolean
 *         description: Filtrer les abonnés en fonction de leur statut d'abonnement
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrer les abonnés en fonction de leur date d'abonnement (après cette date)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrer les abonnés en fonction de leur date d'abonnement (avant cette date)
 *     responses:
 *       '200':
 *         description: Liste des abonnés récupérée avec succès
 *       '400':
 *         description: Erreur lors de la récupération de la liste des abonnés
 */
router.get('/subscribers', NewsletterController.getAllSubscribers);

/**
 * @swagger
 * /newsletter/delete-subscriber:
 *   delete:
 *     summary: Supprimer un abonné
 *     tags: [NewsLetter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 required: true
 *     responses:
 *       '200':
 *         description: Abonné supprimé avec succès
 *       '400':
 *         description: Erreur lors de la suppression de l'abonné
 */
router.delete('/delete-subscriber', NewsletterController.deleteSubscriber);


module.exports = router;

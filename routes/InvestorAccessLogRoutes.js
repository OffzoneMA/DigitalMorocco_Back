const express = require('express');
const router = express.Router();
const InvestorAccessLogController = require('../controllers/InvestorAccessLogController');
const AuthController = require('../controllers/AuthController');

/**
 * @swagger
 * tags:
 *   name: InvestorAccessLog
 *   description: Gestion des logs d'accès investisseurs
 */

/**
 * @swagger
 * /investor-access-logs/{userId}:
 *   post:
 *     summary: Log un accès utilisateur
 *     tags: [InvestorAccessLog]
 *     parameters:
 *      - in: path
 *        name: userId
 *        required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               creditsDeducted:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Log créé
 */
router.post('/:userId', InvestorAccessLogController.logAccess);

/**
 * @swagger
 * /investor-access-logs/{id}:
 *   patch:
 *     summary: Met à jour un log
 *     tags: [InvestorAccessLog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Log mis à jour
 */
router.patch('/:id', InvestorAccessLogController.updateAccessLog);

/**
 * @swagger
 * /investor-access-logs/user/{userId}:
 *   get:
 *     summary: Récupère tous les logs d’un utilisateur
 *     tags: [InvestorAccessLog]
 */
router.get('/user/:userId', InvestorAccessLogController.getAccessLogsByUser);

/**
 * @swagger
 * /investor-access-logs/connectedUser:
 *   get:
 *     summary: Récupère tous les logs d’un utilisateur
 *     tags: [InvestorAccessLog]
 */
router.get('/connectedUser', AuthController.AuthenticateUser , InvestorAccessLogController.getAccessLogsByUser);

/**
 * @swagger
 * /investor-access-logs/user/{userId}/last:
 *   get:
 *     summary: Récupère le dernier log d’un utilisateur
 *     tags: [InvestorAccessLog]
 */
router.get('/user/:userId/last', InvestorAccessLogController.getLastAccessLogByUser);

/**
 * @swagger
 * /investor-access-logs/connectedUser/last:
 *   get:
 *     summary: Récupère le dernier log de l'utilisateur connecté
 *     tags: [InvestorAccessLog]
 */ 
router.get('/connectedUser/last', AuthController.AuthenticateUser, InvestorAccessLogController.getLastAccessLogByConnectedUser);

/**
 * @swagger
 * /investor-access-logs/date/{date}:
 *   get:
 *     summary: Récupère tous les logs d’une date précise (YYYY-MM-DD)
 *     tags: [InvestorAccessLog]
 */
router.get('/date/:date', InvestorAccessLogController.getAccessLogsByDate);

/**
 * @swagger
 * /investor-access-logs/user/{userId}/date/{date}:
 *   get:
 *     summary: Récupère le log d’un utilisateur à une date donnée (YYYY-MM-DD)
 *     tags: [InvestorAccessLog]
 */
router.get('/user/:userId/date/:date', InvestorAccessLogController.getAccessLogsByUserAndDate);

module.exports = router;

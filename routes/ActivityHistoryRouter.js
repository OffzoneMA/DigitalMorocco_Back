// activityHistoryRoutes.js

const express = require('express');
const router = express.Router();
const ActivityHistoryController = require('../controllers/ActivityHistoryController');
const AuthController = require('../controllers/AuthController');

/**
 * @swagger
 * tags:
 *   name: Activity History
 *   description: API for Activity History operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ActivityHistory:
 *       type: object
 *       properties:
 *         eventType:
 *           type: string
 *           required: true
 *         eventData:
 *           type: object
 *           additionalProperties: true
 *           description: Contains additional data related to the event
 *           example:
 *             key: value
 *         timestamp:
 *           type: string
 *           format: date-time
 *         user:
 *           type: string
 *           description: ID of the user associated with this activity history
 *           required: true
 */

/**
 * @swagger
 * /activity-history/user:
 *   get:
 *     summary: Get all activity histories for a user
 *     tags: [Activity History]
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ActivityHistory'
 *       '400':
 *         description: Invalid request
 *       '500':
 *         description: Internal server error
 */
router.get('/user', AuthController.AuthenticateUser, ActivityHistoryController.getAllActivityHistoriesByUser);


/**
 * @swagger
 * /activity-history:
 *   post:
 *     summary: Create Activity History
 *     tags: [Activity History]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivityHistory'
 *     responses:
 *       201:
 *         description: New activity history created successfully
 *       400:
 *         description: Error creating activity history
 */
router.post('/', ActivityHistoryController.createActivityHistoryController);

/**
 * @swagger
 * /activity-history:
 *   get:
 *     summary: Get All Activity Histories
 *     tags: [Activity History]
 *     responses:
 *       200:
 *         description: List of all activity histories
 *       500:
 *         description: Error getting all activity histories
 */
router.get('/', ActivityHistoryController.getAllActivityHistoriesController);

/**
 * @swagger
 * /activity-history/{id}:
 *   delete:
 *     summary: Delete Activity History
 *     tags: [Activity History]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the activity history to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Activity history deleted successfully
 *       500:
 *         description: Error deleting activity history
 */
router.delete('/:id', ActivityHistoryController.deleteActivity);

module.exports = router;

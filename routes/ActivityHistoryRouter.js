// activityHistoryRoutes.js

const express = require('express');
const router = express.Router();
const ActivityHistoryController = require('../controllers/ActivityHistoryController');

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
 *           enum:
 *             - document_shared
 *             - contact_request_sent
 *             - event_registered
 *             - project_created
 *             - event_attended
 *             - document_uploaded
 *             - other
 *           required: true
 *         eventDetails:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         user:
 *           type: string
 *           description: ID of the user associated with this activity history
 *         finalDetails:
 *           type: string
 *         actionTarget:
 *           type: string
 *           description: ID of the action target (e.g., document, project, event)
 *         targetUser:
 *           type: object
 *           properties:
 *             usertype:
 *               type: string
 *               description: Type of the target user (e.g., Investor, Member, Partner, etc.)
 *             userId:
 *               type: string
 *               description: ID of the target user
 *       required:
 *         - eventType
 *         - timestamp
 */


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
 * /activity-history/{memberId}/member:
 *   get:
 *     summary: Get all activity histories for a member
 *     tags: [Activity History]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the member
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
router.get('/:memberId/member', ActivityHistoryController.getAllActivityHistoriesByUser);


module.exports = router;

const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management
 */

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               message:
 *                 type: string
 *               senderId:
 *                 type: string
 *               reference:
 *                 type: string
 *               referenceName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       500:
 *         description: Internal server error
 */
router.post('/', NotificationController.createNotification);

/**
 * @swagger
 * /notifications/{userId}:
 *   get:
 *     summary: Get all notifications for a user
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of notifications for the user
 *       500:
 *         description: Internal server error
 */
router.get('/:userId', NotificationController.getNotificationsByUserId);

/**
 * @swagger
 * /notifications/{userId}/summary:
 *   get:
 *     summary: Get all notifications for a user with the unread count in the last 30 days
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of notifications with unread count
 *       500:
 *         description: Internal server error
 */
router.get('/notifications/:userId/summary', NotificationController.getNotificationsWithUnreadCount);

/**
 * @swagger
 * /notifications/mark-as-read:
 *   put:
 *     summary: Mark multiple notifications as read
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notificationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - notificationIds
 *     responses:
 *       200:
 *         description: Notifications marked as read
 *       400:
 *         description: Invalid notification IDs provided
 *       500:
 *         description: Internal server error
 */
router.put('/notifications/mark-as-read', NotificationController.markNotificationsAsRead);

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the notification
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       500:
 *         description: Internal server error
 */
router.patch('/:notificationId/read', NotificationController.markNotificationAsRead);

/**
 * @swagger
 * /notifications/{notificationId}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the notification
 *     responses:
 *       204:
 *         description: Notification deleted successfully
 *       500:
 *         description: Internal server error
 */
router.delete('/:notificationId', NotificationController.deleteNotification);

module.exports = router;

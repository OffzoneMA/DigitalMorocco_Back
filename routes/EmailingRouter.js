const EmailingController = require('../controllers/EmailingController');
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /emailing/test-email:
 *   post:
 *     summary: Send a test email
 *     tags: [Emailing]
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
 *                 description: The email address to send the test email to
 *               subject:
 *                 type: string
 *                 description: The subject of the test email
 *               htmlContent:
 *                 type: string
 *                 description: The HTML content of the test email
 *               textContent:
 *                 type: string
 *                 description: The plain text content of the test email
 *     responses:
 *       '200':
 *         description: Test email sent successfully
 *       '500':
 *         description: Failed to send test email
 */
router.post('/test-email', EmailingController.testEmailSending);

module.exports = router;
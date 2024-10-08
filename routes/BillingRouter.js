// routes/billingRoutes.js
const express = require('express');
const router = express.Router();
const billingController = require('../controllers/BillingController');
const upload = require("../middelware/multer");
const AuthController = require("../controllers/AuthController");

/**
 * @swagger
 * tags:
 *   name: Billing
 *   description: Billing management
 */

/**
 * @swagger
 * /billing/{userId}:
 *   post:
 *     summary: Create billing for a user
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to create billing for
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100.50
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-31"
 *               status:
 *                 type: string
 *                 enum: [upcoming, paid, to be paid]
 *                 example: "to be paid"
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Billing created successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/:userId', upload.single('document'), billingController.createBilling);

/**
 * @swagger
 * /billing/{userId}:
 *   get:
 *     summary: Get billing records for a user
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to retrieve billing records for
 *     responses:
 *       200:
 *         description: List of billing records
 *       500:
 *         description: Internal Server Error
 */
router.get('/:userId', billingController.getBillingByUser);

/**
 * @swagger
 * /billing/update-status/{billingId}:
 *   put:
 *     summary: Update billing status
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: billingId
 *         required: true
 *         description: ID of the billing record to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [upcoming, paid, to be paid]
 *     responses:
 *       200:
 *         description: Billing status updated successfully
 *       500:
 *         description: Internal Server Error
 */
router.put('/update-status/:billingId', billingController.updateBillingStatus);

/**
 * @swagger
 * /billing:
 *   get:
 *     summary: Get all billing records for a user
 *     tags: [Billing]
 *     responses:
 *       200:
 *         description: A list of billing records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   dueDate:
 *                     type: string
 *                     format: date
 *                   status:
 *                     type: string
 *                     enum: [upcoming, paid, to be paid]
 *                   document:
 *                     type: object
 *                     properties:
 *                       link:
 *                         type: string
 *                       mimetype:
 *                         type: string
 *                       name:
 *                         type: string
 *       500:
 *         description: Internal Server Error
 */
router.get('/', AuthController.AuthenticateUser , billingController.getBillingsForUser);

/**
 * @swagger
 * /{billingId}:
 *   delete:
 *     summary: Delete a billing record
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: billingId
 *         required: true
 *         description: ID of the billing record to delete
 *     responses:
 *       200:
 *         description: Billing deleted successfully
 *       404:
 *         description: Billing not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:billingId', billingController.deleteBilling);

module.exports = router;

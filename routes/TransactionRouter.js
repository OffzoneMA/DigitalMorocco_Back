const TransactionController = require('../controllers/TransactionController');
const express = require('express');
const router = express.Router();

/**
* @swagger
* tags:
*   name: Transaction
*   description: API for managing transactions
*/

/**
 * @swagger
 * /transactions/all:
 *   get:
 *     summary: Retrieve all subscriptions
 *     tags: [Transaction]
 *     responses:
 *       200:
 *         description: List of subscriptions
 *       500:
 *         description: Server error
 */
router.get('/all', TransactionController.getAllTransactions);

/**
 * @swagger
 * /transactions/user/{userId}:
 *   get:
 *     summary: Get subscription for a specific user
 *     tags: [Transaction]
 *     responses:
 *       200:
 *         description: User subscription
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', TransactionController.getAllTransactionsByUser);

/**
 * @swagger
 * /transactions/subscription/{subscriptionId}:
 *   get:
 *     summary: Get subscription for a specific user
 *     tags: [Transaction]
 *     responses:
 *       200:
 *         description: User subscription
 *       500:
 *         description: Server error
 */
router.get('/subscription/:subscriptionId', TransactionController.getAllTransactionsBySubscription);

/**
 * @swagger
 * /transactions/{transactionId}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transaction]
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction details
 *       500:
 *         description: Server error
 */
router.get('/:transactionId', TransactionController.getTransactionById);

/**
 * @swagger
 * /transactions/{transactionId}:
 *   delete:
 *     summary: Delete a transaction
 *     tags: [Transaction]
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction deleted
 *       500:
 *         description: Server error
 */
router.delete('/:transactionId', TransactionController.deleteTransaction);


module.exports = router;
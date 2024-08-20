const express = require("express")
const router = express.Router()
const SubscriptionPlanController = require("../controllers/SubscriptionPlanController")
const AuthController = require("../controllers/AuthController")

/**
 * @swagger
 * tags:
 *   name: Subscription Plan
 *   description: API for Subscription Plan operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SubscriptionPlan:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         creator:
 *           type: string
 *         description:
 *           type: string
 *         dateCreated:
 *           type: string
 *           format: date-time
 *         isAvailable:
 *           type: boolean
 *         featureDescriptions:
 *           type: array
 *           items:
 *             type: string
 *         price:
 *           type: number
 *         annualPrice: 
 *           type: number
 *         annualDiscountRate: 
 *           type: number
 *         duration:
 *           type: number
 *         planType:
 *           type: string
 *         credits:
 *           type: number
 *         hasTrial:
 *           type: boolean
 *         trialDays:
 *           type: number
 *         trialEndDate:
 *           type: string
 *           format: date-time
 *         forUser:
 *           type: string
 *           enum: [Member, Investor]
 *           description: Specifies if the plan is for Members or Investors
 *       required:
 *         - name
 *         - creator
 *         - planType
 */

/**
 * @swagger
 * /subscription-plans/{userId}:
 *   post:
 *     summary: Create a new subscription plan
 *     tags: [Subscription Plan]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the admin user creating the plan
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubscriptionPlan'
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionPlan'
 *       '403':
 *         description: Forbidden - Only admins can create subscription plans
 *       '500':
 *         description: Internal server error
 */
router.post('/:userId', /*AuthController.AuthenticateAdmin ,*/  SubscriptionPlanController.createSubscriptionPlan);


/**
 * @swagger
 * /subscription-plans:
 *   get:
 *     summary: Get all subscription plans
 *     tags: [Subscription Plan]
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SubscriptionPlan'
 *       '500':
 *         description: Internal server error
 */
router.get('/', SubscriptionPlanController.getAllSubscriptionPlans);

/**
 * @swagger
 * /subscription-plans/{planId}:
 *   put:
 *     summary: Get subscription plan by ID
 *     tags: [Subscription Plan]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         description: ID of the subscription plan
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubscriptionPlan'
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionPlan'
 *       '500':
 *         description: Internal server error
 */
router.get('/:planId', SubscriptionPlanController.getSubscriptionPlanById);

/**
 * @swagger
 * /subscription-plans/{planId}:
 *   put:
 *     summary: Update subscription plan by ID
 *     tags: [Subscription Plan]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         description: ID of the subscription plan
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubscriptionPlan'
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionPlan'
 *       '500':
 *         description: Internal server error
 */
router.put('/:planId', SubscriptionPlanController.updateSubscriptionPlan);

/**
 * @swagger
 * /subscription-plans/{planId}:
 *   delete:
 *     summary: Delete subscription plan by ID
 *     tags: [Subscription Plan]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         description: ID of the subscription plan
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: Internal server error
 */
router.delete('/:planId', SubscriptionPlanController.deleteSubscriptionPlan);

module.exports = router
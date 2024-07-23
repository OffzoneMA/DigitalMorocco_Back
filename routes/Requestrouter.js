const express = require("express")
const router = express.Router()
const requestController = require("../controllers/Requests")
const AuthController = require("../controllers/AuthController")

// Middleware to authenticate admin
// router.use(AuthController.AuthenticateAdmin);

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: Request management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Request:
 *       type: object
 *       required:
 *         - user
 *       properties:
 *         user:
 *           type: string
 *           description: The user ID associated with the request
 *         linkedin_link:
 *           type: string
 *           description: The LinkedIn link (for investors)
 *         num_rc:
 *           type: string
 *           description: The RC number (for partners)
 *         rc_ice:
 *           type: string
 *           description: The RC/ICE file link (for members)
 *         dateCreated:
 *           type: string
 *           format: date
 *           description: The date the request was created
 */

/**
 * @swagger
 * /requests/{id}/{role}:
 *   post:
 *     summary: Create a new request
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *       - in: path
 *         name: role
 *         schema:
 *           type: string
 *           enum: [member, investor, partner]
 *         required: true
 *         description: The user role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Request'
 *     responses:
 *       201:
 *         description: The request was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Request'
 *       400:
 *         description: Bad request
 */
router.post('/:id/:role', requestController.createRequest);

/**
 * @swagger
 * /requests:
 *   get:
 *     summary: Get all requests
 *     tags: [Requests]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [member, investor, partner]
 *         required: true
 *         description: The type of requests to fetch
 *       - in: query
 *         name: start
 *         schema:
 *           type: integer
 *         description: Pagination start index
 *       - in: query
 *         name: qt
 *         schema:
 *           type: integer
 *         description: Quantity of requests to fetch
 *     responses:
 *       200:
 *         description: The list of requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Request'
 */
router.get('/', requestController.getRequests);

/**
 * @swagger
 * /requests/{userId}/{role}:
 *   get:
 *     summary: Get a request by user ID and role
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *       - in: path
 *         name: role
 *         schema:
 *           type: string
 *           enum: [member, investor, partner]
 *         required: true
 *         description: The user role
 *     responses:
 *       200:
 *         description: The request description by user ID and role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Request'
 *       404:
 *         description: The request was not found
 */
router.get('/:userId/:role', requestController.getRequestByUserId);

/**
 * @swagger
 * /requests/{id}/{type}:
 *   delete:
 *     summary: Delete a request by ID and type
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The request ID
 *       - in: path
 *         name: type
 *         schema:
 *           type: string
 *           enum: [member, investor, partner]
 *         required: true
 *         description: The request type
 *     responses:
 *       204:
 *         description: The request was successfully deleted
 *       404:
 *         description: The request was not found
 */
router.delete('/:id/:type', requestController.removeRequest);

/**
 * @swagger
 * /requests/user/{userId}/{type}:
 *   delete:
 *     summary: Delete a request by user ID and type
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *       - in: path
 *         name: type
 *         schema:
 *           type: string
 *           enum: [member, investor, partner]
 *         required: true
 *         description: The request type
 *     responses:
 *       204:
 *         description: The request was successfully deleted
 *       404:
 *         description: The request was not found
 */
router.delete('/user/:userId/:type', requestController.removeRequestByUserId);

module.exports = router
const express = require("express")
const router = express.Router()
const EventController = require("../controllers/EventController")

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: API for managing Events
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - _id
 *         - title
 *         - description
 *         - summary
 *         - date
 *         - startTime
 *         - endTime
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         summary:
 *           type: string
 *         promoCode:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         startTime:
 *           type: string
 *         endTime:
 *           type: string
 *         locationType:
 *           type: string
 *           enum:
 *             - online
 *             - physical
 *         physicalLocation:
 *           type: string
 *         coordinates:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *         creator:
 *           type: string
 *           format: ObjectId
 *         image:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         youtubeVideo:
 *           type: string
 *         zoomLink:
 *           type: string
 *         zoomMeetingID:
 *           type: string
 *         zoomPasscode:
 *           type: string
 *         ticketInfo:
 *           type: object
 *           properties:
 *             price:
 *               type: number
 *             salesEndDate:
 *               type: string
 *               format: date
 *             availableQuantity:
 *               type: number
 */

/**
 * @swagger
 * /events/createEvent:
 *   post:
 *     summary: Create a new event
 *     description: Create a new event with the provided details
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Bad request
 */
router.post('/createEvent', EventController.createEvent);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events
 *     description: Retrieve a list of all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
router.get('/', EventController.getEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get an event by ID
 *     description: Retrieve an event by its ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the event
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 */
router.get('/:id', EventController.getEventById);

/**
 * @swagger
 * /events/update/{id}:
 *   put:
 *     summary: Update an event by ID
 *     description: Update an existing event by its ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the event
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 */
router.put('/update/:id', EventController.updateEvent);

/**
 * @swagger
 * /events/delete/{id}:
 *   delete:
 *     summary: Delete an event by ID
 *     description: Delete an event by its ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the event
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 */
router.delete('/delete/:id', EventController.deleteEvent);

/**
 * @swagger
 * /events/user/{userId}/events:
 *   get:
 *     summary: Get all events created by a user.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               events: [...]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: Error message
 */
router.get('/user/:userId/events', EventController.getAllEventsByUser);

/**
 * @swagger
 * /events/{eventId}/add-attendee:
 *   post:
 *     summary: Add an attendee to an event.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Attendee information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               jobTitle:
 *                 type: string
 *               city:
 *                 type: string
 *               lastName:
 *                 type: string
 *               emailAddress:
 *                 type: string
 *               companyName:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               event: {...}
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: Error message
 */
router.post('/:eventId/add-attendee', EventController.addAttendeeToEvent);


module.exports = router
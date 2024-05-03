const express = require("express");
const router = express.Router();
const EventController = require("../controllers/EventController");
const AuthController = require("../controllers/AuthController");
const upload = require("../middelware/multer");

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
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier of the event.
 *         title:
 *           type: string
 *           description: The title of the event.
 *         description:
 *           type: string
 *           description: The detailed description of the event.
 *         summary:
 *           type: string
 *           description: A brief summary of the event.
 *         promoCode:
 *           type: string
 *           description: The promotional code for the event.
 *         startDate:
 *           type: string
 *           format: date
 *           description: The start date of the event.
 *         endDate:
 *           type: string
 *           format: date
 *           description: The end date of the event.
 *         startTime:
 *           type: string
 *           description: The start time of the event.
 *         endTime:
 *           type: string
 *           description: The end time of the event.
 *         locationType:
 *           type: string
 *           enum: [online, physical]
 *           description: The type of event location.
 *         category:
 *           type: string
 *           enum: [Workshop, Seminar, Conference, Other]
 *           description: The category of the event.
 *         industry:
 *           type: string
 *           description: The industry of the event.
 *         physicalLocation:
 *           type: string
 *           description: The physical location of the event.
 *         latitude:
 *           type: number
 *           description: The latitude coordinate of the event location.
 *         longitude:
 *           type: number
 *           description: The longitude coordinate of the event location.
 *         creator:
 *           type: string
 *           description: The ID of the user who created the event.
 *         headerImage:
 *           type: string
 *           format: binary
 *           description: The header image file for the event (optional)
 *         image:
 *           type: string
 *           description: The URL of the image associated with the event.
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: List of tags associated with the event.
 *         youtubeVideo:
 *           type: string
 *           description: The YouTube video link for the event.
 *         zoomLink:
 *           type: string
 *           description: The Zoom meeting link for the event.
 *         zoomMeetingID:
 *           type: string
 *           description: The Zoom meeting ID for the event.
 *         zoomPasscode:
 *           type: string
 *           description: The Zoom meeting passcode for the event.
 *         price:
 *           type: number
 *           description: The price of the event ticket.
 *         salesEndDate:
 *           type: string
 *           format: date
 *           description: The sales end date of the event ticket.
 *         availableQuantity:
 *           type: number
 *           description: The available quantity of event tickets.
 *         attendees:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The first name of the attendee.
 *               phoneNumber:
 *                 type: string
 *                 description: The phone number of the attendee.
 *               jobTitle:
 *                 type: string
 *                 description: The job title of the attendee.
 *               city:
 *                 type: string
 *                 description: The city of the attendee.
 *               lastName:
 *                 type: string
 *                 description: The last name of the attendee.
 *               emailAddress:
 *                 type: string
 *                 description: The email address of the attendee.
 *               companyName:
 *                 type: string
 *                 description: The company name of the attendee.
 *               country:
 *                 type: string
 *                 description: The country of the attendee.
 *         organizerLogo:
 *           type: string
 *           description: The URL of the organizer's logo.
 *         organizername:
 *           type: string
 *           description: The name of the organizer.
 *         status:
 *           type: string
 *           enum: [past, upcoming]
 *           description: The status of the event.
 *         sponsors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 description: The URL of the sponsor's logo.
 *               name:
 *                 type: string
 *                 description: The name of the sponsor.
 */

/**
 * @swagger
 * /events/createEvent:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               headerImage:
 *                 type: string
 *                 format: binary
 *                 description: The image file for the event (optional)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file for the event (optional)
 *               title:
 *                 type: string
 *                 description: The title of the event
 *               description:
 *                 type: string
 *                 description: The description of the event
 *               summary:
 *                 type: string
 *                 description: A brief summary of the event
 *               promoCode:
 *                 type: string
 *                 description: The promotional code for the event (optional)
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: The start date of the event
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: The end date of the event
 *               startTime:
 *                 type: string
 *                 description: The start time of the event 
 *               endTime:
 *                 type: string
 *                 description: The end time of the event 
 *               locationType:
 *                 type: string
 *                 enum: [online, physical]
 *                 description: The type of event location
 *               category:
 *                 type: string
 *                 enum: [Workshop, Seminar, Conference, Other]
 *                 description: The category of the event
 *               industry:
 *                 type: string
 *                 description: The industry of the event
 *               physicalLocation:
 *                 type: string
 *                 description: The physical location of the event
 *               latitude:
 *                 type: number
 *                 description: The latitude coordinate of the event location
 *               longitude:
 *                 type: number
 *                 description: The longitude coordinate of the event location
 *               creator:
 *                 type: string
 *                 description: The ID of the user who created the event
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of tags associated with the event
 *               youtubeVideo:
 *                 type: string
 *                 description: The YouTube video link for the event (optional)
 *               zoomLink:
 *                 type: string
 *                 description: The Zoom meeting link for the event (optional)
 *               zoomMeetingID:
 *                 type: string
 *                 description: The Zoom meeting ID for the event (optional)
 *               zoomPasscode:
 *                 type: string
 *                 description: The Zoom meeting passcode for the event (optional)
 *               price:
 *                 type: number
 *                 description: The price of the event ticket
 *               salesEndDate:
 *                 type: string
 *                 format: date
 *                 description: The sales end date of the event ticket 
 *               availableQuantity:
 *                 type: number
 *                 description: The available quantity of event tickets
 *               organizername:
 *                 type: string
 *                 description: The name of the organizer.
 *               attendees:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       description: The first name of the attendee
 *                     phoneNumber:
 *                       type: string
 *                       description: The phone number of the attendee
 *                     jobTitle:
 *                       type: string
 *                       description: The job title of the attendee
 *                     city:
 *                       type: string
 *                       description: The city of the attendee
 *                     lastName:
 *                       type: string
 *                       description: The last name of the attendee
 *                     emailAddress:
 *                       type: string
 *                       description: The email address of the attendee
 *                     companyName:
 *                       type: string
 *                       description: The company name of the attendee
 *                     country:
 *                       type: string
 *                       description: The country of the attendee
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/createEvent',AuthController.AuthenticateUser,upload.fields([{ name: 'image', maxCount: 1 },{ name: 'headerImage', maxCount: 1 },{ name: 'organizerLogo', maxCount: 1 }]), EventController.createEvent);

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
 * /events/update/{eventId}:
 *   put:
 *     summary: Modifier un événement existant.
 *     description: Permet de mettre à jour les détails d'un événement existant, y compris les images.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'événement à modifier.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               headerImage:
 *                 type: string
 *                 format: binary
 *                 description: The image file for the event (optional)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file for the event (optional)
 *               title:
 *                 type: string
 *                 description: The title of the event
 *               description:
 *                 type: string
 *                 description: The description of the event
 *               summary:
 *                 type: string
 *                 description: A brief summary of the event
 *               promoCode:
 *                 type: string
 *                 description: The promotional code for the event (optional)
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: The start date of the event
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: The end date of the event
 *               startTime:
 *                 type: string
 *                 description: The start time of the event 
 *               endTime:
 *                 type: string
 *                 description: The end time of the event 
 *               locationType:
 *                 type: string
 *                 enum: [online, physical]
 *                 description: The type of event location
 *               category:
 *                 type: string
 *                 enum: [Workshop, Seminar, Conference, Other]
 *                 description: The category of the event
 *               industry:
 *                 type: string
 *                 description: The industry of the event
 *               physicalLocation:
 *                 type: string
 *                 description: The physical location of the event
 *               latitude:
 *                 type: number
 *                 description: The latitude coordinate of the event location
 *               longitude:
 *                 type: number
 *                 description: The longitude coordinate of the event location
 *               creator:
 *                 type: string
 *                 description: The ID of the user who created the event
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of tags associated with the event
 *               youtubeVideo:
 *                 type: string
 *                 description: The YouTube video link for the event (optional)
 *               zoomLink:
 *                 type: string
 *                 description: The Zoom meeting link for the event (optional)
 *               zoomMeetingID:
 *                 type: string
 *                 description: The Zoom meeting ID for the event (optional)
 *               zoomPasscode:
 *                 type: string
 *                 description: The Zoom meeting passcode for the event (optional)
 *               price:
 *                 type: number
 *                 description: The price of the event ticket
 *               salesEndDate:
 *                 type: string
 *                 format: date
 *                 description: The sales end date of the event ticket 
 *               availableQuantity:
 *                 type: number
 *                 description: The available quantity of event tickets
 *               organizername:
 *                 type: string
 *                 description: The name of the organizer.
 *               attendees:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       description: The first name of the attendee
 *                     phoneNumber:
 *                       type: string
 *                       description: The phone number of the attendee
 *                     jobTitle:
 *                       type: string
 *                       description: The job title of the attendee
 *                     city:
 *                       type: string
 *                       description: The city of the attendee
 *                     lastName:
 *                       type: string
 *                       description: The last name of the attendee
 *                     emailAddress:
 *                       type: string
 *                       description: The email address of the attendee
 *                     companyName:
 *                       type: string
 *                       description: The company name of the attendee
 *                     country:
 *                       type: string
 *                       description: The country of the attendee
 *     responses:
 *       '200':
 *         description: Événement mis à jour avec succès.
 *       '400':
 *         description: Requête incorrecte, vérifiez les données envoyées.
 *       '404':
 *         description: L'événement à mettre à jour n'a pas été trouvé.
 *       '500':
 *         description: Erreur interne du serveur.
 */

router.put('/update/:eventId',upload.fields([{ name: 'image', maxCount: 1 },{ name: 'headerImage', maxCount: 1 },{ name: 'organizerLogo', maxCount: 1 }]), EventController.updateEvent);

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

router.delete('/supprimer-collection', EventController.supprimerCollection);



module.exports = router
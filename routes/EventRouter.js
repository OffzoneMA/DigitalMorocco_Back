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
 * /events/createWithJson:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     description: Create a new event with the provided details.
 *     requestBody:
 *       description: Event object that needs to be added
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
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/createWithJson', EventController.createEventWithJson);

/**
 * @swagger
 * /events/{eventId}/promo-codes:
 *   post:
 *     summary: Ajouter un nouveau code promotionnel à un événement
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'événement auquel ajouter le code promotionnel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 required: true
 *               discountPercentage:
 *                 type: number
 *                 required: true
 *               minOrderAmount:
 *                 type: number
 *                 default: 0
 *               valid:
 *                 type: boolean
 *                 default: true
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *                 required: true
 *     responses:
 *       '200':
 *         description: Code promotionnel ajouté avec succès à l'événement
 *       '400':
 *         description: Erreur lors de l'ajout du code promotionnel
 */
router.post('/:eventId/promo-codes', EventController.addPromoCode);

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
 * /events/authuser:
 *   get:
 *     summary: Get all events for the authenticated user
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number to retrieve
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           example: 10
 *         description: The number of records per page
 *       - in: query
 *         name: eventNames
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by the investor type
 *       - in: query
 *         name: physicalLocation
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: industries
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by preferred investment industries
 *     description: Retrieves all events in which the authenticated user has participated.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of events successfully retrieved.
 *       403:
 *         description: Unauthorized. The user is not authenticated.
 *       500:
 *         description: Internal server error. Failed to retrieve events.
 */
router.get('/authuser', AuthController.AuthenticateUser, EventController.getEventsForUser);

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
router.get('/:id/withParticipate', AuthController.AuthenticateUser , EventController.getEventByIdWithParticipate);

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
router.get('/:id' , EventController.getEventById);


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
 *               status:
 *                 type: string
 *                 enum: [past, upcoming , ongoing]
 *                 description: The type of event location
 *               category:
 *                 type: string
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

/**
 * @swagger
 * /events/{eventId}/attendeesuser:
 *   post:
 *     summary: Add an attendee to an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user to be added as an attendee
 *                 example: "60d0fe4f5311236168a109ca"
 *               role:
 *                 type: string
 *                 enum: [investor, member, partner, other]
 *                 description: The role of the attendee
 *                 example: "member"
 *     responses:
 *       201:
 *         description: Attendee added successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
router.post('/:eventId/attendeesuser', EventController.addConnectedAttendee);

router.delete('/supprimer-collection', EventController.supprimerCollection);

/**
 * @swagger
 * /events/distinct/{field}:
 *   get:
 *     summary: Get distinct values for a specific field
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: field
 *         required: true
 *         schema:
 *           type: string
 *         description: The field to get distinct values for
 *       - name: status
 *         in: query
 *         description: Filter by event status (e.g., upcoming, past)
 *         schema:
 *           type: string
 *       - name: date
 *         in: query
 *         description: Filter by event date
 *         schema:
 *           type: string
 *           format: date
 *       - name: type
 *         in: query
 *         description: Filter by event type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of distinct values
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Server error
 */
router.get('/distinct/:field', EventController.getDistinctFieldValues);

/**
 * @swagger
 * /events/past/participate:
 *   get:
 *     summary: Get past events with user participation status
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number to retrieve
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           example: 10
 *         description: The number of records per page
 *     responses:
 *       200:
 *         description: List of past events with user participation status
 *       500:
 *         description: Server error
 */
router.get('/past/participate', AuthController.AuthenticateUser, EventController.getPastEventsForUserParticipate);

/**
 * @swagger
 * /events/upcoming/participate:
 *   get:
 *     summary: Get upcoming events with user participation status
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number to retrieve
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           example: 10
 *         description: The number of records per page
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter events by location
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events starting from this date
 *     responses:
 *       200:
 *         description: List of upcoming events with user participation status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 totalPages:
 *                   type: integer
 *                   description: The total number of pages
 *       500:
 *         description: Server error
 */
router.get('/upcoming/participate', AuthController.AuthenticateUser, EventController.getAllUpcomingEventsForUserParticipate);

/**
 * @swagger
 * /events/upcoming/partner:
 *   get:
 *     summary: Get upcoming events with user participation status with sponsor status
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number to retrieve
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           example: 10
 *         description: The number of records per page
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter events by location
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events starting from this date
 *     responses:
 *       200:
 *         description: List of upcoming events with user participation status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 totalPages:
 *                   type: integer
 *                   description: The total number of pages
 *       500:
 *         description: Server error
 */
router.get('/upcoming/partner', AuthController.AuthenticateUser, AuthController.AuthenticatePartner , EventController.getUpcomingEventsWithoutSponsorNotSent);


/**
 * @swagger
 * /events/distinct/user/{field}:
 *   get:
 *     summary: Get distinct values of a specific field from events attended by the user
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: field
 *         required: true
 *         schema:
 *           type: string
 *         description: The field to get distinct values from
 *     responses:
 *       200:
 *         description: List of distinct values
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.get('/distinct/user/:field', AuthController.AuthenticateUser, EventController.getDistinctValuesForUser);

/**
 * @swagger
 * /events/partner/distinct/{field}:
 *   get:
 *     summary: Get distinct values of a specific field from events not sponsor sent
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: field
 *         required: true
 *         schema:
 *           type: string
 *         description: The field to get distinct values from
 *     responses:
 *       200:
 *         description: List of distinct values
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.get('/partner/distinct/:field', AuthController.AuthenticatePartner , EventController.getDistinctFieldValuesUpcomingEventNotSent);


module.exports = router
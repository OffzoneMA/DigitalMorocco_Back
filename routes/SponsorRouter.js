const express = require('express');
const router = express.Router();
const SponsorController = require('../controllers/SponsorController');
const AuthController = require("../controllers/AuthController");
const upload = require("../middelware/multer")


/**
 * @swagger
 * tags:
 *   name: Sponsors
 *   description: Operations related to sponsors
 */

/**
 * @swagger
 * /sponsors:
 *   post:
 *     summary: Create a sponsor
 *     tags: [Sponsors]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:  # Changement pour supporter l'upload de fichiers
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: ID of the event (required)
 *               sponsorshipAmount:
 *                 type: number
 *                 description: Amount of sponsorship (required)
 *               sponsorshipType:
 *                 type: string
 *                 description: Type of sponsorship
 *               letter:
 *                 type: string
 *                 description: letter
 *               requestType:
 *                 type: string
 *                 description: Type of request (sent/received, required)
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Optional document to be uploaded (e.g., agreement, contract)
 *             required:
 *               - eventId
 *               - requestType
 *     responses:
 *       201:
 *         description: Sponsor created successfully
 *       400:
 *         description: Bad request (invalid data or missing fields)
 *       404:
 *         description: Partner or event not found
 */
router.post('/', AuthController.AuthenticatePartner, upload.single('document'), SponsorController.createSponsor);

/**
 * @swagger
 * /sponsors/{partnerId}/forPartner:
 *   post:
 *     summary: Create a sponsor
 *     tags: [Sponsors]
 *     parameters:
 *       - name: partnerId
 *         in: path
 *         required: true
 *         description: ID of the partner
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:  # Changement pour supporter l'upload de fichiers
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: ID of the event (required)
 *               sponsorshipAmount:
 *                 type: number
 *                 description: Amount of sponsorship (required)
 *               sponsorshipType:
 *                 type: string
 *                 description: Type of sponsorship
 *               letter:
 *                 type: string
 *                 description: letter
 *               requestType:
 *                 type: string
 *                 description: Type of request (sent/received, required)
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Optional document to be uploaded (e.g., agreement, contract)
 *             required:
 *               - eventId
 *               - requestType
 *     responses:
 *       201:
 *         description: Sponsor created successfully
 *       400:
 *         description: Bad request (invalid data or missing fields)
 *       404:
 *         description: Partner or event not found
 */
router.post('/:partnerId/forPartner' , upload.single('document'), SponsorController.createSponsorForPartner);


/**
 * @swagger
 * /sponsors:
 *   get:
 *     summary: Get all sponsors with pagination and filtering
 *     tags: [Sponsors]
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: Number of sponsors per page
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: status
 *         in: query
 *         description: Status of the sponsor (Pending, Approved, Rejected)
 *         schema:
 *           type: string
 *       - name: requestType
 *         in: query
 *         description: Type of request (sent/received)
 *         schema:
 *           type: string
 *       - name: exactDate
 *         in: query
 *         description: Exact date to filter sponsors
 *         schema:
 *           type: string
 *           format: date
 *       - name: location
 *         in: query
 *         description: Location of the event
 *         schema:
 *           type: string
 *       - name: sponsorshipType
 *         in: query
 *         description: Type of sponsorship
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of sponsors
 *       500:
 *         description: Internal server error
 */
router.get('/', SponsorController.getAllSponsors);

/**
 * @swagger
 * /sponsors/{sponsorId}/approve:
 *   post:
 *     summary: Approve a sponsor with a letter
 *     tags: [Sponsors]
 *     parameters:
 *       - name: sponsorId
 *         in: path
 *         required: true
 *         description: ID of the sponsor
 *         schema:
 *           type: string
 *       - name: sponsorshipType
 *         in: body
 *         required: true
 *         description: Type of sponsorship
 *         schema:
 *           type: string
 *       - name: approvalLetter
 *         in: body
 *         required: true
 *         description: Approval letter
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sponsor approved successfully
 *       404:
 *         description: Sponsor not found
 *       400:
 *         description: Bad request
 */
router.post('/:sponsorId/approve', SponsorController.approveSponsor);

/**
 * @swagger
 * /sponsors/{sponsorId}/reject:
 *   post:
 *     summary: Reject a sponsor with a reason
 *     tags: [Sponsors]
 *     parameters:
 *       - name: sponsorId
 *         in: path
 *         required: true
 *         description: ID of the sponsor
 *         schema:
 *           type: string
 *       - name: reasonForRejection
 *         in: body
 *         required: true
 *         description: Reason for rejection
 *         schema:
 *           type: string
 *       - name: rejectionNotes
 *         in: body
 *         required: true
 *         description: Rejection letter
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sponsor rejected successfully
 *       404:
 *         description: Sponsor not found
 *       400:
 *         description: Reason for rejection is required
 */
router.post('/:sponsorId/reject', SponsorController.rejectSponsor)

/**
 * @swagger
 * /sponsors/{sponsorId}:
 *   put:
 *     summary: Update a sponsor
 *     tags: [Sponsors]
 *     parameters:
 *       - name: sponsorId
 *         in: path
 *         required: true
 *         description: ID of the sponsor
 *         schema:
 *           type: string
 *       - name: updateData
 *         in: body
 *         required: true
 *         description: Data to update
 *         schema:
 *           type: object
 *           properties:
 *             sponsorshipAmount:
 *               type: number
 *             sponsorshipType:
 *               type: string
 *             requestType:
 *               type: string
 *     responses:
 *       200:
 *         description: Sponsor updated successfully
 *       404:
 *         description: Sponsor not found
 */
router.put('/:sponsorId', SponsorController.updateSponsor);

/**
 * @swagger
 * /sponsors/{sponsorId}:
 *   delete:
 *     summary: Delete a sponsor
 *     tags: [Sponsors]
 *     parameters:
 *       - name: sponsorId
 *         in: path
 *         required: true
 *         description: ID of the sponsor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sponsor deleted successfully
 *       404:
 *         description: Sponsor not found
 */
router.delete('/:sponsorId', SponsorController.deleteSponsor);

/**
 * @swagger
 * /sponsors/partners:
 *   get:
 *     summary: Get all sponsors for a specific partner
 *     tags: [Sponsors]
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: Number of sponsors per page
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: status
 *         in: query
 *         description: Status of the sponsor (Pending, Approved, Rejected)
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - name: sponsorshipType
 *         in: query
 *         description: Type of sponsorship
 *         schema:
 *           type: string
 *       - in: query
 *         name: requestType
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: exactDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for filtering sponsor requests by creation date.
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location of events
 *     responses:
 *       200:
 *         description: A list of sponsors for the partner
 *       404:
 *         description: Partner not found
 *       500:
 *         description: Internal server error
 */
router.get('/partners', AuthController.AuthenticatePartner , SponsorController.getSponsorsByPartner);

/**
 * @swagger
 * /sponsors/partners/history:
 *   get:
 *     summary: Get all sponsors hidtory for a specific partner
 *     tags: [Sponsors]
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: Number of sponsors per page
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: status
 *         in: query
 *         description: Status of the sponsor (Pending, Approved, Rejected)
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - name: sponsorshipType
 *         in: query
 *         description: Type of sponsorship
 *         schema:
 *           type: string
 *       - in: query
 *         name: requestType
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: exactDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for filtering sponsor requests by creation date.
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location of events
 *     responses:
 *       200:
 *         description: A list of sponsors for the partner
 *       404:
 *         description: Partner not found
 *       500:
 *         description: Internal server error
 */
router.get('/partners/history', AuthController.AuthenticatePartner , SponsorController.getSponsorsHistoryByPartner);


/**
 * @swagger
 * /sponsors/past-events:
 *   get:
 *     summary: Get approved sponsors for past events
 *     tags: [Sponsors]
 *     parameters:
 *       - name: sponsorshipType
 *         in: query
 *         description: Type of sponsorship to filter by
 *         schema:
 *           type: string
 *       - name: partnerId
 *         in: query
 *         description: ID of the partner to filter by
 *         schema:
 *           type: string
 *       - name: exactDate
 *         in: query
 *         description: Exact date to filter sponsors
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: A list of approved sponsors for past events
 *       500:
 *         description: Internal server error
 */
router.get('/past-events', SponsorController.getApprovedSponsorsForPastEvents);

/**
 * @swagger
 * /sponsors/approved-sponsors:
 *   get:
 *     summary: Get approved sponsors for a specific partner
 *     tags: [Sponsors]
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: Number of sponsors per page
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: sponsorshipType
 *         in: query
 *         description: Type of sponsorship to filter by
 *         schema:
 *           type: string
 *       - name: location
 *         in: query
 *         description: Event location
 *         schema:
 *           type: string
 *       - name: exactDate
 *         in: query
 *         description: Exact date to filter sponsors
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: A list of approved sponsors for the specified partner

 *       404:
 *         description: Partner not found
 *       500:
 *         description: Internal server error
 */
router.get('/approved-sponsors', AuthController.AuthenticatePartner , SponsorController.getApprovedSponsorsForPartner);

/**
 * @swagger
 * /sponsors/partner/distinct:
 *   get:
 *     summary: Get distinct values of a specific field for sponsored events by a partner
 *     tags: [Sponsors]
 *     parameters:
 *       - in: query
 *         name: field
 *         required: true
 *         description: The field for which to retrieve distinct values (e.g., physicalLocation)
 *         schema:
 *           type: string
 *       - in: query
 *         name: eventStatus
 *         required: false
 *         description: The status of the events to filter by (e.g., upcoming, past)
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: sponsorStatus
 *         required: false
 *         description: The status of the events to filter by (e.g., upcoming, past)
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: Distinct values retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       404:
 *         description: Partner not found
 *       500:
 *         description: Server error
 */
router.get('/partner/distinct' , AuthController.AuthenticatePartner , SponsorController.getDistinctEventFieldsByPartner);

/**
 * @swagger
 * /sponsors/partner/distinct:
 *   get:
 *     summary: Get distinct values of a specific field for sponsored events by a partner
 *     tags: [Sponsors]
 *     parameters:
 *       - in: query
 *         name: field
 *         required: true
 *         description: The field for which to retrieve distinct values (e.g., physicalLocation)
 *         schema:
 *           type: string
 *       - in: query
 *         name: eventStatus
 *         required: false
 *         description: The status of the events to filter by (e.g., upcoming, past)
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: sponsorStatus
 *         required: false
 *         description: The status of the events to filter by (e.g., upcoming, past)
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: Distinct values retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       404:
 *         description: Partner not found
 *       500:
 *         description: Server error
 */
router.get('/partner/history/distinct' , AuthController.AuthenticatePartner , SponsorController.getDistinctEventFieldsByPartnerHistory);


/**
 * @swagger
 * /sponsors/{sponsorId}:
 *   get:
 *     summary: Get a sponsor by ID
 *     tags: [Sponsors]
 *     parameters:
 *       - name: sponsorId
 *         in: path
 *         required: true
 *         description: ID of the sponsor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sponsor found
 *       404:
 *         description: Sponsor not found
 *       500:
 *         description: Internal server error
 */
router.get('/:sponsorId', SponsorController.getSponsorById);


module.exports = router;

const express = require('express');
const router = express.Router();
const SponsorController = require('../controllers/SponsorController');

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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               partnerId:
 *                 type: string
 *                 description: ID of the partner (required)
 *               eventId:
 *                 type: string
 *                 description: ID of the event (required)
 *               sponsorshipAmount:
 *                 type: number
 *                 description: Amount of sponsorship (required)
 *               sponsorshipType:
 *                 type: string
 *                 description: Type of sponsorship
 *               requestType:
 *                 type: string
 *                 description: Type of request (sent/received, required)
 *             required:
 *               - partnerId
 *               - eventId
 *               - sponsorshipAmount
 *               - requestType
 *     responses:
 *       201:
 *         description: Sponsor created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sponsor'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Partner or event not found
 */
router.post('/', SponsorController.createSponsor);

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
 *       - name: letter
 *         in: query
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
 *         in: query
 *         required: true
 *         description: Reason for rejection
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
router.post('/:sponsorId/reject', SponsorController.rejectSponsor);

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
 * /sponsors/{partnerId}/partners:
 *   get:
 *     summary: Get all sponsors for a specific partner
 *     tags: [Sponsors]
 *     parameters:
 *       - name: partnerId
 *         in: path
 *         required: true
 *         description: ID of the partner
 *         schema:
 *           type: string
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
 *       - name: sponsorshipType
 *         in: query
 *         description: Type of sponsorship
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of sponsors for the partner
 *       404:
 *         description: Partner not found
 *       500:
 *         description: Internal server error
 */
router.get('/:partnerId/partners', SponsorController.getSponsorsByPartner);

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
 * /sponsors/{partnerId}/approved-sponsors:
 *   get:
 *     summary: Get approved sponsors for a specific partner
 *     tags: [Sponsors]
 *     parameters:
 *       - name: partnerId
 *         in: path
 *         required: true
 *         description: ID of the partner
 *         schema:
 *           type: string
 *       - name: sponsorshipType
 *         in: query
 *         description: Type of sponsorship to filter by
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
router.get('/:partnerId/approved-sponsors', SponsorController.getApprovedSponsorsForPartner);

module.exports = router;

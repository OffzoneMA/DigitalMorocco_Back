const express = require('express');
const router = express.Router();
const contactRequestController = require('../controllers/contactRequestController');

/**
 * @swagger
 * tags:
 *   name: ContactRequests
 *   description: Contact request management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ContactRequest:
 *       type: object
 *       required:
 *         - member
 *         - investor
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the contact request
 *         member:
 *           type: string
 *           description: The member ID
 *         investor:
 *           type: string
 *           description: The investor ID
 *         project:
 *           type: string
 *           description: The project ID
 *         cost:
 *           type: number
 *           description: The cost of the contact request
 *         requestLetter:
 *           type: string
 *           description: The request letter
 *         document:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: The name of the document
 *             link:
 *               type: string
 *               description: The link to the document
 *             mimeType:
 *               type: string
 *               description: The MIME type of the document
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date of the contact request
 *         communicationStatus:
 *           type: string
 *           description: The communication status
 *         notes:
 *           type: string
 *           description: Notes about the contact request
 *         status:
 *           type: string
 *           enum:
 *             - Pending
 *             - Accepted
 *             - Rejected
 *             - In Progress
 *           description: The status of the contact request
 *         dateCreated:
 *           type: string
 *           format: date-time
 *           description: The date the contact request was created
 *       example:
 *         _id: "5f8d0d55b54764421b7156c3"
 *         member: "5f8d0d55b54764421b7156c2"
 *         investor: "5f8d0d55b54764421b7156c1"
 *         project: "5f8d0d55b54764421b7156c4"
 *         cost: 1000
 *         requestLetter: "This is a request letter."
 *         document:
 *           name: "document.pdf"
 *           link: "http://example.com/document.pdf"
 *           mimeType: "application/pdf"
 *         date: "2023-01-01T00:00:00.000Z"
 *         communicationStatus: "In Progress"
 *         notes: "These are some notes."
 *         status: "Pending"
 *         dateCreated: "2023-01-01T00:00:00.000Z"
 *     Member:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the member
 *         companyName:
 *           type: string
 *           description: The company name
 *         website:
 *           type: string
 *           description: The company website
 *         city:
 *           type: string
 *           description: The city of the company
 *         contactEmail:
 *           type: string
 *           description: The contact email of the company
 *         logo:
 *           type: string
 *           description: The logo of the company
 *         country:
 *           type: string
 *           description: The country of the company
 *     Investor:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the investor
 *         name:
 *           type: string
 *           description: The name of the investor
 *         linkedin_link:
 *           type: string
 *           description: The LinkedIn profile link of the investor
 */


/**
 * @swagger
 * /contact-requests:
 *   get:
 *     summary: Get all contact requests
 *     tags: [ContactRequests]
 *     responses:
 *       200:
 *         description: The list of contact requests.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ContactsHistory:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ContactRequest'
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 */
router.get('/', contactRequestController.getAllContactRequests);

/**
 * @swagger
 * /contact-requests/{id}:
 *   get:
 *     summary: Get a contact request by ID
 *     tags: [ContactRequests]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The contact request ID
 *     responses:
 *       200:
 *         description: The contact request description by ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContactRequest'
 *       404:
 *         description: The contact request was not found.
 */
router.get('/:id', contactRequestController.getContactRequestById);

/**
 * @swagger
 * /contact-requests:
 *   post:
 *     summary: Create a new contact request
 *     tags: [ContactRequests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactRequest'
 *     responses:
 *       201:
 *         description: The contact request was successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContactRequest'
 *       500:
 *         description: Some server error
 */
router.post('/', contactRequestController.createContactRequest);

/**
 * @swagger
 * /contact-requests/{id}:
 *   put:
 *     summary: Update a contact request
 *     tags: [ContactRequests]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The contact request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactRequest'
 *     responses:
 *       200:
 *         description: The contact request was successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContactRequest'
 *       404:
 *         description: The contact request was not found.
 *       500:
 *         description: Some server error
 */
router.put('/:id', contactRequestController.updateContactRequest);

/**
 * @swagger
 * /contact-requests/{id}:
 *   delete:
 *     summary: Delete a contact request
 *     tags: [ContactRequests]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The contact request ID
 *     responses:
 *       204:
 *         description: The contact request was successfully deleted.
 *       404:
 *         description: The contact request was not found.
 *       500:
 *         description: Some server error
 */
router.delete('/:id', contactRequestController.deleteContactRequest);

/**
 * @swagger
 * /contact-requests/{id}/approve:
 *   put:
 *     summary: Approve a contact request
 *     tags: [ContactRequests]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the contact request to approve
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approvalNotes:
 *                 type: string
 *               typeInvestment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully approved the request
 *       400:
 *         description: Invalid request
 */
router.put('/:id/approve', contactRequestController.approveRequest);

/**
 * @swagger
 * /contact-requests/{id}/reject:
 *   put:
 *     summary: Reject a contact request
 *     tags: [ContactRequests]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the contact request to reject
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *               rejectionNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully rejected the request
 *       400:
 *         description: Invalid request
 */
router.put('/:id/reject' , contactRequestController.rejectRequest);

module.exports = router;

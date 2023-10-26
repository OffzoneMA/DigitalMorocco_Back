const express = require("express")
const router = express.Router()
const InvestorController = require("../controllers/InvestorController")
const AuthController = require("../controllers/AuthController")
const upload = require("../middelware/multer")

/**
 * @swagger
 * components:
 *   schemas:
 *     Investor:
 *       type: object
 *       required:
 *         - _id
 *         - owner
 *         - linkedin_link
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the member
 *         owner:
 *           type: string
 *           description: the auto-generated id of the user
 *         linkedin_link:
 *           type: string
 *           description: The linkedIn link of the investor
 *       example:
 *         id: 64e0b85a9c819e682229ca82
 *         owner: 867b85a9c819e68222g7685
 *         linkedin_link: https://www.linkedin.com/in/investor-e-9a4848485/
 */
/**
 * @swagger
 * tags:
 *   name: Investors
 *   description: Managing API of the Investor
 * /investors:
 *   get:
 *     summary: Get all investors from the DB
 *     description: list of all investors exited 
 *     tags: [Investors]
 *     security:
 *       - jwtToken: []  #you can enter only the admin or the member user token other users are forbidden to access
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Investor'
 */
router.route("/").get(AuthController.AuthenticateSubMemberOrAdmin,InvestorController.getInvestors)

/**
 * @swagger
 * /investors/ContactRequest:
 *   get:
 *     summary: Get all contact requests from the member 
 *     description: list of all the sent member's contact requets the pending ones rejected and accepted
 *     tags: [Investors]
 *     security:
 *       - jwtToken: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
router.route("/ContactRequest").get(AuthController.AuthenticateInvestor, InvestorController.getContactRequests)


/**
 * @swagger
 * /investors/ContactRequest/{requestId}:
 *   put:
 *     summary: Update contact request status
 *     description: Update the status of a contact request based on the requestId.
 *     tags: [Investors]
 *     security:
 *       - jwtToken: []
 *     parameters:
 *       - name: requestId
 *         in: path
 *         description: The ID of the contact request to update.
 *         required: true
 *         schema:
 *           type: string
 *       - name: status
 *         in: body
 *         description: The new status for the contact request (accepted or rejected).
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending,accepted,rejected]
 *     responses:
 *       200:
 *         description: Successful update of the contact request status.
 *       400:
 *         description: Invalid status or missing request.
 *       401:
 *         description: Unauthorized. Authentication token is missing or invalid.
 *       404:
 *         description: Contact request not found.
 *       500:
 *         description: Internal Server Error

 */
router.route("/ContactRequest/:requestId").put(AuthController.AuthenticateInvestor, InvestorController.updateContactStatus);
/**
 * @swagger
 * /investors/Contacts:
 *   get:
 *     summary: Get all investor's contacts 
 *     description: list of all investor's accepted contacts of member 
 *     tags: [Investors]
 *     security:
 *       - jwtToken: []
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               message: Error message describing the issue
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (user not authorized)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.route("/Contacts").get(AuthController.AuthenticateInvestor, InvestorController.getContacts)

/**
 * @swagger
 * /investors/Projects:
 *   get:
 *     summary: Get all member's projects 
 *     description: list of all member's projects 
 *     tags: [Investors]
 *     security:
 *       - jwtToken: []
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               message: Error message describing the issue
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (user not authorized)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.route("/Projects").get(AuthController.AuthenticateInvestor, InvestorController.getProjects)

router.route("/chat/:memberId").post(AuthController.AuthenticateInvestor, InvestorController.createChatRoomWithMember);

router.route("/chat/:conversationId/messages").get(AuthController.AuthenticateInvestor, InvestorController.getChatMessagesInRoom);
router.route("/chat/:conversationId/messages").post(AuthController.AuthenticateInvestor, InvestorController.sendChatMessageInRoom);
router.route('/conversations/:investorId').get(AuthController.AuthenticateInvestor, InvestorController.getInvestorConversations);

module.exports = router
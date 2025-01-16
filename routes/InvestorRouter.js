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
 *     description: Get a list of all investors, with optional pagination and filtering.
 *     tags: [Investors]
 *     security:
 *       - jwtToken: []  # Only admin or member user tokens are allowed; other users are forbidden
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
 *         name: type
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by the investor type
 *       - in: query
 *         name: location
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
 *     responses:
 *       200:
 *         description: A list of investors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 investors:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Investor'
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages
 *                 currentPage:
 *                   type: integer
 *                   description: Current page number
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       403:
 *         description: Forbidden - Access denied for this user type
 *       500:
 *         description: Server error
 */
router.route("/").get(AuthController.AuthenticateSubMemberOrAdmin, InvestorController.getInvestors)

/**
 * @swagger
 * tags:
 *   name: Investors
 *   description: Managing API of the Investor
 * /investors/forMember:
 *   get:
 *     summary: Get all investors from the DB
 *     description: Get a list of all investors, with optional pagination and filtering.
 *     tags: [Investors]
 *     security:
 *       - jwtToken: []  # Only admin or member user tokens are allowed; other users are forbidden
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
 *         name: type
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by the investor type
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: keywords
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
 *     responses:
 *       200:
 *         description: A list of investors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 investors:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Investor'
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages
 *                 currentPage:
 *                   type: integer
 *                   description: Current page number
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       403:
 *         description: Forbidden - Access denied for this user type
 *       500:
 *         description: Server error
 */
router.route("/forMember").get(AuthController.AuthenticateSubMemberOrAdmin, AuthController.AuthenticateMember , InvestorController.getInvestorsForMember)

/**
 * @swagger
 * tags:
 *   name: Investors
 *   description: Managing API of the Investor
 * /investors/withoutPage:
 *   get:
 *     summary: Get all investors from the DB
 *     description: Get a list of all investors, with optional pagination and filtering.
 *     tags: [Investors]
 *     security:
 *       - jwtToken: []  # Only admin or member user tokens are allowed; other users are forbidden
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by the investor type
 *       - in: query
 *         name: location
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
 *     responses:
 *       200:
 *         description: A list of investors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 investors:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Investor'
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages
 *                 currentPage:
 *                   type: integer
 *                   description: Current page number
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       403:
 *         description: Forbidden - Access denied for this user type
 *       500:
 *         description: Server error
 */
router.route("/withoutPage").get(AuthController.AuthenticateSubMemberOrAdmin, InvestorController.getAllInvestorsWithoutPagination)


/**
 * @swagger
 * tags:
 *   name: Investors
 *   description: Managing API of the Investor
 * /investors/all:
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
router.route("/all").get(InvestorController.getAllInvestors)

/**
 * @swagger
 * /investors:
 *   post:
 *     summary: Create a new investor
 *     tags: [Investors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               owner:
 *                 type: string
 *                 description: The user ID of the owner
 *                 example: "60d0fe4f5311236168a109ca"
 *               name:
 *                 type: string
 *                 description: The name of the investor
 *                 example: "Investor Name"
 *               legalName:
 *                 type: string
 *                 description: The legal name of the investor
 *                 example: "Investor Legal Name"
 *               companyType:
 *                 type: string
 *                 description: The type of company
 *                 example: "VC"
 *               description:
 *                 type: string
 *                 description: The description of the investor
 *                 example: "Description of the investor"
 *               foundedDate:
 *                 type: string
 *                 description: The date the company was founded
 *                 example: "2022-01-01"
 *               headquarter:
 *                 type: string
 *                 description: The headquarter of the company
 *                 example: "New York, USA"
 *               investmentStage:
 *                 type: string
 *                 description: The investment stage
 *                 example: "Series A"
 *               lastFundingType:
 *                 type: string
 *                 description: The last funding type
 *                 example: "Seed"
 *               phoneNumber:
 *                 type: string
 *                 description: The phone number of the investor
 *                 example: "+1234567890"
 *               emailAddress:
 *                 type: string
 *                 description: The email address of the investor
 *                 example: "investor@example.com"
 *               investmentCapacity:
 *                 type: number
 *                 description: The investment capacity of the investor
 *                 example: 1000000
 *               image:
 *                 type: string
 *                 description: The image URL of the investor
 *                 example: "http://example.com/image.jpg"
 *               investorType:
 *                 type: string
 *                 description: The type of investor
 *                 example: "Angel"
 *               website:
 *                 type: string
 *                 description: The website of the investor
 *                 example: "http://example.com"
 *               fund:
 *                 type: number
 *                 description: The fund amount
 *                 example: 500000
 *               fundingRound:
 *                 type: string
 *                 description: The funding round
 *                 example: "Series B"
 *               acquisitions:
 *                 type: number
 *                 description: The number of acquisitions
 *                 example: 2
 *               linkedin_link:
 *                 type: string
 *                 description: The LinkedIn link
 *                 example: "http://linkedin.com/in/investor"
 *               type:
 *                 type: string
 *                 description: The type
 *                 example: "Corporate"
 *               location:
 *                 type: string
 *                 description: The location
 *                 example: "San Francisco, USA"
 *               PreferredInvestmentIndustry:
 *                 type: string
 *                 description: The preferred investment industry
 *                 example: "Technology"
 *               numberOfInvestment:
 *                 type: number
 *                 description: The number of investments
 *                 example: 10
 *               numberOfExits:
 *                 type: number
 *                 description: The number of exits
 *                 example: 3
 *               document:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     link:
 *                       type: string
 *               numberofInvestment:
 *                 type: number
 *                 description: The number of investments
 *                 example: 10
 *               numberofExits:
 *                 type: number
 *                 description: The number of exits
 *                 example: 3
 *               investments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     announcementDate:
 *                       type: string
 *                     companyName:
 *                       type: string
 *                     companyLogo:
 *                       type: string
 *                     location:
 *                       type: string
 *                     fundingRound:
 *                       type: string
 *                     moneyRaised:
 *                       type: number
 *     responses:
 *       201:
 *         description: The investor was successfully created
 *       500:
 *         description: Some server error
 */
router.post('/', InvestorController.addInvestor);

/**
 * @swagger
 * tags:
 *   name: InvestorRequests
 *   description: Managing API of Investor Requests
 * /investors/investor-requests:
 *   get:
 *     summary: Récupérer la liste des demandes d'investisseurs
 *     tags: [Investors]
 *     responses:
 *       '200':
 *         description: OK - La liste des demandes d'investisseurs a été récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si la requête a réussi.
 *                   example: true
 *                 data:
 *                   type: array
 *                   description: Liste des demandes d'investisseurs.
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: string
 *                         description: ID de l'utilisateur associé à la demande d'investisseur.
 *                         example: "609b3aa7d91bc50d8433a1c5"
 *                       linkedin_link:
 *                         type: string
 *                         description: Lien LinkedIn de l'investisseur.
 *                         example: "https://www.linkedin.com/in/johndoe/"
 *                       dateCreated:
 *                         type: string
 *                         format: date-time
 *                         description: Date de création de la demande.
 *                         example: "2024-05-02T12:34:56.789Z"
 *                       status:
 *                         type: string
 *                         description: Statut de la demande d'investisseur.
 *                         example: "In Progress"
 *                       communicationStatus:
 *                         type: string
 *                         description: Statut de la communication associée à la demande.
 *                         example: "Pending"
 *                       Note:
 *                         type: string
 *                         description: Note associée à la demande d'investisseur.
 *                         example: "Meeting scheduled for next week."
 *       '500':
 *         description: Erreur interne du serveur - Impossible de récupérer la liste des demandes d'investisseurs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si la requête a réussi.
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Message d'erreur décrivant la cause de l'échec de la requête.
 *                   example: "Internal server error."
 */
router.get('/investor-requests', InvestorController.getInvestorRequests);

/**
 * @swagger
 * tags:
 *   name: InvestorRequests
 *   description: Managing API of Investor Requests
 * /api/investor-requests:
 *   get:
 *     summary: Récupérer la liste des demandes d'investisseurs
 *     responses:
 *       '200':
 *         description: OK - La liste des demandes d'investisseurs a été récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si la requête a réussi.
 *                   example: true
 *                 data:
 *                   type: array
 *                   description: Liste des demandes d'investisseurs.
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: string
 *                         description: ID de l'utilisateur associé à la demande d'investisseur.
 *                         example: "609b3aa7d91bc50d8433a1c5"
 *                       linkedin_link:
 *                         type: string
 *                         description: Lien LinkedIn de l'investisseur.
 *                         example: "https://www.linkedin.com/in/johndoe/"
 *                       dateCreated:
 *                         type: string
 *                         format: date-time
 *                         description: Date de création de la demande.
 *                         example: "2024-05-02T12:34:56.789Z"
 *                       status:
 *                         type: string
 *                         description: Statut de la demande d'investisseur.
 *                         example: "In Progress"
 *                       communicationStatus:
 *                         type: string
 *                         description: Statut de la communication associée à la demande.
 *                         example: "Pending"
 *                       Note:
 *                         type: string
 *                         description: Note associée à la demande d'investisseur.
 *                         example: "Meeting scheduled for next week."
 *       '500':
 *         description: Erreur interne du serveur - Impossible de récupérer la liste des demandes d'investisseurs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si la requête a réussi.
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Message d'erreur décrivant la cause de l'échec de la requête.
 *                   example: "Internal server error."
 */
router.get('/investor-requests', InvestorController.getInvestorRequests);

/**
 * @swagger
 * /investors/ContactRequest:
 *   get:
 *     summary: Get all contact requests from the member 
 *     description: list of all the sent member's contact requets the pending ones rejected and accepted
 *     tags: [Investors]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Number of records per page for pagination
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by status of the contact request
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country of the contact request project
 *       - in: query
 *         name: projectStage
 *         schema:
 *           type: string
 *         description: Filter by stage of the contact request project
 *       - in: query
 *         name: projectSectors
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: projectStatus
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: dateCreated
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for filtering contact requests by creation date.
 *       - in: query
 *         name: funding
 *         schema:
 *           type: number
 *           example: 500000
 *         description: Filter contact requests by funding amount of the project.
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
 * /investors/contact-requests/recent-approved:
 *   get:
 *     summary: Get 5 most recent approved contact requests
 *     description: Retrieve the 5 most recent contact requests with status 'Approved' for the logged-in user (either investor or member).
 *     tags:
 *       - Investors
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the 5 most recent approved contact requests
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       500:
 *         description: Server error
 */
router.get('/contact-requests/recent-approved', AuthController.AuthenticateInvestor , InvestorController.getRecentApprovedContactRequests);

/**
 * @swagger
 * /investors/ContactRequestByUser/{investorId}:
 *   get:
 *     summary: Get all contact requests from the member 
 *     description: list of all the sent member's contact requets the pending ones rejected and accepted
 *     tags: [Investors]
 *     parameters:
 *       - in: path
 *         name: investorId
 *         required: true
 *         description: ID of the investor
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Number of records per page for pagination
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by status of the contact request
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country of the contact request project
 *       - in: query
 *         name: projectStage
 *         schema:
 *           type: string
 *         description: Filter by stage of the contact request project
 *       - in: query
 *         name: projectSectors
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: projectStatus
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: dateCreated
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for filtering contact requests by creation date.
 *       - in: query
 *         name: funding
 *         schema:
 *           type: number
 *           example: 500000
 *         description: Filter contact requests by funding amount of the project.
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
router.route("/ContactRequestByUser/:investorId").get(InvestorController.getContactRequestsByInvestor)


/**
 * @swagger
 * /investors/ContactRequest/{requestId}/{status}:
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
 *         in: path
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
router.route("/ContactRequest/:requestId/:status").put(AuthController.AuthenticateInvestor , InvestorController.updateContactStatus);
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

/**
 * @swagger
 * /investors/{investorId}/contact-requests:
 *   get:
 *     summary: Get all contact requests for an investor
 *     tags: [Investors]
 *     parameters:
 *       - in: path
 *         name: investorId
 *         required: true
 *         description: ID of the investor
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful operation
 */
router.get('/investors/:investorId/contact-requests', InvestorController.getContactRequestsForInvestor);

router.route("/Projects").get(AuthController.AuthenticateInvestor, InvestorController.getProjects)

/**
 * @swagger
 * /investors/byId/{id}:
 *   get:
 *     summary: Récupérer les détails d'un investisseur par ID
 *     tags: [Investors]
 *     description: Récupère les informations d'un investisseur spécifique à l'aide de son ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'investisseur récupérés avec succès
 *       404:
 *         description: Investisseur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put("/byId/:id", InvestorController.getInvestorById);


/**
 * @swagger
 * /investors/{id}:
 *   put:
 *     summary: Update an existing investor
 *     tags: [Investors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the investor to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the investor
 *               legalName:
 *                 type: string
 *                 description: The legal name of the investor
 *               companyType:
 *                 type: string
 *                 description: The type of the company
 *               description:
 *                 type: string
 *                 description: A description of the investor
 *               foundedDate:
 *                 type: string
 *                 description: The date the company was founded
 *               headquarter:
 *                 type: string
 *                 description: The location of the headquarters
 *               investmentStage:
 *                 type: string
 *                 description: The investment stage
 *               lastFundingType:
 *                 type: string
 *                 description: The last funding type
 *               phoneNumber:
 *                 type: string
 *                 description: The phone number of the investor
 *               emailAddress:
 *                 type: string
 *                 description: The email address of the investor
 *               investmentCapacity:
 *                 type: number
 *                 description: The investment capacity of the investor
 *               image:
 *                 type: string
 *                 description: The image URL of the investor
 *               investorType:
 *                 type: string
 *                 description: The type of investor
 *               website:
 *                 type: string
 *                 description: The website of the investor
 *               fund:
 *                 type: number
 *                 description: The fund amount
 *               fundingRound:
 *                 type: string
 *                 description: The funding round
 *               acquisitions:
 *                 type: number
 *                 description: The number of acquisitions
 *               linkedin_link:
 *                 type: string
 *                 description: The LinkedIn link of the investor
 *               type:
 *                 type: string
 *                 description: The type of investor
 *               location:
 *                 type: string
 *                 description: The location of the investor
 *               PreferredInvestmentIndustry:
 *                 type: string
 *                 description: The preferred investment industry
 *               numberOfInvestment:
 *                 type: number
 *                 description: The number of investments
 *               numberOfExits:
 *                 type: number
 *                 description: The number of exits
 *     responses:
 *       200:
 *         description: The investor was successfully updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Investor not found
 */
router.put("/:id", InvestorController.updateInvestor);

/**
 * @swagger
 * /investors/{investorId}/details:
 *   get:
 *     summary: Récupérer les détails d'un investisseur par ID
 *     tags: [Investors]
 *     description: Récupère les informations d'un investisseur spécifique à l'aide de son ID.
 *     parameters:
 *       - in: path
 *         name: investorId
 *         required: true
 *         description: ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'investisseur récupérés avec succès
 *       404:
 *         description: Investisseur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get("/:investorId/details", AuthController.AuthenticateMember , InvestorController.getInvestorDetails);
/**
 * @swagger
 * /investors/distinct/{field}:
 *   get:
 *     summary: Get distinct values of a specified field from investors
 *     tags: [Investors]
 *     parameters:
 *       - in: path
 *         name: field
 *         required: true
 *         description: The field for which to get distinct values (e.g., type, location, companyType)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of distinct values
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.get('/distinct/:field', InvestorController.getDistinctInvestorData);

/**
 * @swagger
 * /investors/contactRequests/distinct-project-fields:
 *   get:
 *     summary: Récupère les valeurs distinctes des champs d'un projet liés aux requêtes de contact
 *     tags: 
 *       - Investors
 *     parameters:
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *         description: Rôle de l'utilisateur (member ou investor)
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur (member ou investor)
 *       - in: query
 *         name: field
 *         required: true
 *         schema:
 *           type: string
 *         description: Champ du projet pour lequel récupérer des valeurs distinctes
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         description: Statut des requêtes de contact à filtrer (par exemple 'approved', 'pending', etc.)
 *     responses:
 *       200:
 *         description: Liste des valeurs distinctes récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 distinctValues:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Erreur lors de la récupération des valeurs distinctes
 */
router.get('/contactRequests/distinct-project-fields', AuthController.AuthenticateInvestor , InvestorController.getDistinctRequestProjectFields);

/**
 * @swagger
 * /investors/request/distinct/{field}:
 *   get:
 *     summary: Get distinct field values from contact requests
 *     description: Retrieve distinct values of a specified field for contact requests by member or investor.
 *     tags: [ContactRequests]
 *     parameters:
 *       - name: field
 *         in: path
 *         description: The field to retrieve distinct values from (e.g., status, investorNames)
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response with distinct values
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 distinctValues:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error retrieving distinct values
 */
router.get('/request/distinct/:field', AuthController.AuthenticateInvestor ,  InvestorController.getDistinctRequestValues);

/**
 * @swagger
 * /investors/{investorId}:
 *   delete:
 *     summary: Delete an investor by ID
 *     tags: [Investors]
 *     parameters:
 *       - in: path
 *         name: investorId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the investor to delete
 *     responses:
 *       200:
 *         description: Investor deleted successfully
 *       404:
 *         description: Investor not found
 */
router.delete('/:investorId', InvestorController.deleteInvestorById);

/**
 * @swagger
 * /investors/recent-requests/last:
 *   get:
 *     summary: Get 5 most recent contact requests with optional status filter
 *     description: Fetch the 5 most recent contact requests for a member or investor, with an optional status filter.
 *     tags: [Investors]
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           description: Filter by status (e.g., 'Approved,Pending'). Multiple statuses can be separated by commas.
 *     responses:
 *       '200':
 *         description: Successfully fetched the 5 most recent contact requests.
 *       '500':
 *         description: Internal Server Error.
 */
router.get('/recent-requests/last', AuthController.AuthenticateInvestor , InvestorController.getLastRecentContactRequests);

/**
 * @swagger
 * /investors/contact-requests/count:
 *   get:
 *     summary: Get contact requests count for a specific investor
 *     description: Retrieve the total number of contact requests and those with status "In Progress" for an investor.
 *     tags: [ContactRequests]
 *     responses:
 *       200:
 *         description: Counts of total and in-progress contact requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRequests:
 *                   type: integer
 *                   description: Total number of contact requests
 *                   example: 10
 *                 inProgressRequests:
 *                   type: integer
 *                   description: Number of contact requests with status "In Progress"
 *                   example: 3
 *       500:
 *         description: Server error
 */
router.get('/contact-requests/count', InvestorController.getContactRequestsCount);



module.exports = router
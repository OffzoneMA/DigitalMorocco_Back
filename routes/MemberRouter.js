const express = require("express")
const router = express.Router()
const MemberController = require("../controllers/MemberController")
const AuthController = require("../controllers/AuthController")
const upload = require("../middelware/multer")

/**
 * @swagger
 * components:
 *   schemas:
 *     Member (Start-Up):
 *       type: object
 *       required:
 *         - _id
 *         - companyName
 *         - desc
 *         - logo
 *         - website
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the member
 *         companyName:
 *           type: string
 *           description: the name of the startup
 *         desc:
 *           type: string
 *           description: The description of the startup
 *         logo:
 *           type: string
 *           description: the logo of the startup
 *         website: 
 *           type: string
 *           description: the website of the startup
 *         country: 
 *           type: string
 *           description: the website of the startup
 *         
 *       example:
 *         id: 64e0b85a9c819e682229ca82
 *         companyName: Digital Works
 *         desc: Enhancing health care through digital patient-provider connectivity.
 *         logo: https://firebasestorage.googleapis.com/v0/b/digital-morocco-806c5.appspot.com/o/Members%2F64d0fd3f4ad21c95e8456f69%2Flogo?alt=media&token=4e609d74-43a4-4f8b-926f-3b8c19a70d37
 *         website: Works.net
 */
/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Managing API of the Member (or Start-Up) 
 * /members:
 *   get:
 *     summary: Get all members from the DB
 *     description: list of all members exited 
 *     tags: [Members]
 *     security:
 *       - jwtToken: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member (Start-Up)'
 */
router.route("/").get( MemberController.getMembers).post(AuthController.AuthenticateMember, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'files', maxCount: 5 }]) ,MemberController.createEnterprise)

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Managing API of the Member (or Start-Up) 
 * /members/company:
 *   post:
 *     summary: Ajouter une company à un membre
 *     description: Endpoint permettant d'ajouter un company à un membre existant
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: L'ID du membre auquel l'company doit être ajouté
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *               jobTitle:
 *                 type: string
 *               level:
 *                 type: string
 *               department:
 *                 type: string
 *               country:
 *                 type: string
 *               cityState:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               workEmail:
 *                 type: string
 *               personalEmail:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               personalTaxIdentifierNumber:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Employé ajouté avec succès
 *       '400':
 *         description: Requête invalide
 *       '401':
 *         description: Non autorisé
 *       '500':
 *         description: Erreur interne du serveur
 */
router.route("/company/:userId").post(AuthController.AuthenticateMember,MemberController.addCompanyToMember)

/**
 * @swagger
 * /members/name/{name}:
 *   get:
 *     summary: Get member by name
 *     description: enter the name of member or start-up u want to get
 *     tags: [Members]
 *     parameters:
 *       - name: name
 *         in: path
 *         description: The name that needs to be fetched. Use fazefza for testing.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.route("/name/:name").get(MemberController.getByName)

/**
 * @swagger
 * /members/project:
 *   post:
 *     summary: Create a project for a member
 *     description: Create a project for a member by providing project details and documents.
 *     tags: [Members]
 *     security:
 *       - jwtToken: []  # Define the security scheme here if needed
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - funding
 *               - currency
 *               - details
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the project.
 *               funding:
 *                 type: number
 *                 description: The funding amount for the project.
 *               totalRaised:
 *                 type: number
 *                 description: The funding amount for the project.
 *               currency:
 *                 type: string
 *                 enum: [MAD, €, $]
 *                 description: The currency of the funding amount.
 *               stage:
 *                 type: string
 *               sector:
 *                 type: string
 *               status:
 *                 type: string
 *               website:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               listMembers:
 *                 type: array
 *                 description: List of team members working on the project.
 *                 items:
 *                   type: object
 *                   properties:
 *                     employee:
 *                       type: string
 *                     image:
 *                       type: string
 *                     photo:
 *                       type: string
 *                     status:
 *                       type: string
 *                     jobTitle:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     workEmail:
 *                       type: string
 *                     personalEmail:
 *                       type: string
 *               details:
 *                 type: string
 *                 description: Details about the project.
 *               stages:
 *                 type: array
 *                 items:
 *                   type: string
 *               milestones:
 *                 type: array
 *                 description: List of project milestones.
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Name of the milestone.
 *                     description:
 *                       type: string
 *                       description: Description of the milestone.
 *                     dueDate:
 *                       type: string
 *                       format: date
 *                       description: Due date of the milestone.
 *               pitchDeck:
 *                 type: string
 *                 format: binary
 *               businessPlan:
 *                 type: string
 *                 format: binary
 *               financialProjection:
 *                 type: string
 *                 format: binary
 *               logo:
 *                 type: string
 *                 format: binary
 *               files:
 *                 type: array
 *                 description: List of project documents.
 *                 items:
 *                   type: string
 *                   format: binary
 *               documents:
 *                 type: array
 *                 description: List of project documents.
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Name of the document.
 *                     link:
 *                       type: string
 *                       format: binary
 *                       description: Document file (PDF, DOCX, etc.).
 *                     date:
 *                       type: string
 *                       description: Date of the document.
 *                     type:
 *                       type: string
 *                       description: Type of the document.
 *           example:
 *             name: "ProjectName"
 *             funding: 10000.0
 *             currency: "€"
 *             listMembers:
 *               - firstName: "John"
 *                 lastName: "Doe"
 *                 role: "Developer"
 *             details: "Project details"
 *             milestones:
 *               - name: "Milestone 1"
 *                 description: "Description of Milestone 1"
 *                 dueDate: "2024-04-30"
 *               - name: "Milestone 2"
 *                 description: "Description of Milestone 2"
 *                 dueDate: "2024-05-15"
 *             documents:
 *               - name: "Document1"
 *                 link: "http://example.com/document1.pdf"
 *                 date: "2024-04-16"
 *                 type: "application/pdf"
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Bad Request - Invalid input data
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       500:
 *         description: Internal Server Error
 */
router.route("/project").post(AuthController.AuthenticateMember, upload.fields([{ name: 'businessPlan', maxCount: 1 },{ name: 'financialProjection', maxCount: 1 },{ name: 'pitchDeck', maxCount: 1 }, { name: 'logo', maxCount: 1 },{ name: 'files', maxCount: 8 }]), MemberController.createProject)

/**
 * @swagger
 * /members/project/{projectId}:
 *   put:
 *     summary: Update a project for a member
 *     description: Update an existing project for a member by providing updated project details and documents.
 *     tags: [Members]
 *     security:
 *       - jwtToken: []  # Define the security scheme here if needed
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the project to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the project.
 *               funding:
 *                 type: number
 *                 description: The funding amount for the project.
 *               totalRaised:
 *                 type: number
 *                 description: The funding amount for the project.
 *               currency:
 *                 type: string
 *                 enum: [MAD, €, $]
 *                 description: The currency of the funding amount.
 *               stage:
 *                 type: string
 *               sector:
 *                 type: string
 *               status:
 *                 type: string
 *               website:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               listMembers:
 *                 type: array
 *                 description: List of team members working on the project.
 *                 items:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       description: First name of the team member.
 *                     lastName:
 *                       type: string
 *                       description: Last name of the team member.
 *                     role:
 *                       type: string
 *                       description: Role of the team member.
 *               details:
 *                 type: string
 *                 description: Details about the project.
 *               milestones:
 *                 type: array
 *                 description: List of project milestones.
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Name of the milestone.
 *                     description:
 *                       type: string
 *                       description: Description of the milestone.
 *                     dueDate:
 *                       type: string
 *                       format: date
 *                       description: Due date of the milestone.
 *               pitchDeck:
 *                 type: string
 *                 format: binary
 *               businessPlan:
 *                 type: string
 *                 format: binary
 *               financialProjection:
 *                 type: string
 *                 format: binary
 *               logo:
 *                 type: string
 *                 format: binary
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Bad Request - Invalid input data
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       404:
 *         description: Not Found - Project not found
 *       500:
 *         description: Internal Server Error
 */
router.put("/project/:projectId", AuthController.AuthenticateMember, upload.fields([{ name: 'businessPlan', maxCount: 1 },{ name: 'financialProjection', maxCount: 1 },{ name: 'pitchDeck', maxCount: 1 } , { name: 'logo', maxCount: 1 },{ name: 'files', maxCount: 8 }]), MemberController.updateProject);

/**
 * @swagger
 * /members/sendContact:
 *   post:
 *     summary: Create a contact request
 *     tags: [Members]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               investorId:
 *                 type: string
 *                 description: ID of the investor to contact
 *               projectId:
 *                 type: string
 *                 description: ID of the project
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Document file
 *               data:
 *                 type: object
 *                 description: Additional data for the contact request
 *     responses:
 *       201:
 *         description: Contact request created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/sendContact', AuthController.AuthenticateMember , upload.single('document'), MemberController.contactRequest);

/**
 * @swagger
 * /members/share-project:
 *   post:
 *     summary: Share a project with multiple investors
 *     description: Share a project with a list of investors and send them an email with project details.
 *     tags:
 *       - Projects
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: string
 *                 description: ID of the project to be shared
 *               investorIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of investor IDs to share the project with
 *     responses:
 *       200:
 *         description: Requests were processed successfully
 *       500:
 *         description: Server error
 */
router.post("/share-project", AuthController.AuthenticateMember, MemberController.shareProject);

/**
 * @swagger
 * /members/ContactRequest:
 *   get:
 *     summary: Get all contact requests of the member
 *     description: List of all the member's contact requests sent to investors with optional filtering, sorting, and pagination.
 *     tags: [Members]
 *     security:
 *       - jwtToken: [] # Only accessible with a valid JWT token
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
 *         name: investorNames
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by investor names (multiple selection allowed)
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized - Authentication is required
 *       500:
 *         description: Server error
 */
router.route("/ContactRequest").get(AuthController.AuthenticateMember, MemberController.getContactRequests)

/**
 * @swagger
 * /members/Contacts:
 *   get:
 *     summary: Get all members's contacts 
 *     description: list of all member's accepted contacts by investor
 *     tags: [Members]
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
router.route("/Contacts").get(AuthController.AuthenticateMember, MemberController.getContacts)

/**
 * @swagger
 * /members/company:
 *   post:
 *     summary: Create a company for a member
 *     tags: [Members]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: memberId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the member
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               legalName:
 *                 type: string
 *               website:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               desc:
 *                 type: string
 *               address:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               stage:
 *                 type: string
 *               state:
 *                 type: string
 *               companyType:
 *                 type: string
 *               taxNbr:
 *                 type: string
 *               corporateNbr:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *       produces:
 *          - multipart/form-data
 *     responses:
 *       200:
 *         description: Company created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
 *       400:
 *         description: Bad request, check the request body
 */
router.post("/company",AuthController.AuthenticateMember, upload.single('logo'), MemberController.createCompany);

/**
 * @swagger
 * /members/companies:
 *   post:
 *     summary: Créer ou mettre à jour une entreprise pour un membre, un investisseur ou un partenaire.
 *     tags: [Members]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 description: Le rôle de l'utilisateur (member, investor, partner)
 *               companyName:
 *                 type: string
 *               legalName:
 *                 type: string
 *               website:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               desc:
 *                 type: string
 *               address:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               stage:
 *                 type: string
 *               state:
 *                 type: string
 *               companyType:
 *                 type: string
 *               taxNbr:
 *                 type: string
 *               corporateNbr:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Logo de l'entreprise
 *     responses:
 *       200:
 *         description: Entreprise créée ou mise à jour avec succès.
 *       500:
 *         description: Erreur lors de la création ou de la mise à jour de l'entreprise.
 */
router.post('/companies', AuthController.AuthenticateUser, upload.single('logo'), MemberController.createTestCompany);


/**
 * @swagger
 * /members/{userId}:
 *   post:
 *     summary: Create a company for a member
 *     tags: [Members]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the member
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               legalName:
 *                 type: string
 *               website:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               desc:
 *                 type: string
 *               address:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               stage:
 *                 type: string
 *               state:
 *                 type: string
 *               companyType:
 *                 type: string
 *               taxNbr:
 *                 type: string
 *               corporateNbr:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *       produces:
 *          - multipart/form-data
 *     responses:
 *       200:
 *         description: Company created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
 *       400:
 *         description: Bad request, check the request body
 */
router.post("/:userId", upload.single('logo'), MemberController.CreateMemberWithLogo);

/**
 * @swagger
 * /members/testAll:
 *   get:
 *     summary: Get a list of all members
 *     tags: [Members]
 *     responses:
 *       200:
 *         description: A list of members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Member'
 */
router.get("/testAll", MemberController.getTestAllMembers);

/**
 * @swagger
 * /members/contact-requests:
 *   get:
 *     summary: Get all contact requests for a member
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: ID of the member
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful operation
 */
router.get('/members/contact-requests', AuthController.AuthenticateMember, MemberController.getContactRequestsForMember);

/**
 * @swagger
 * /members/{userId}:
 *   post:
 *     summary: Create a new member for a user.
 *     description: Create a new member for the specified user.
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user for whom to create the member.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *                 description: The name of the company.
 *               legalName:
 *                 type: string
 *                 description: The legal name of the company.
 *     responses:
 *       201:
 *         description: Member created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the created member.
 *                 owner:
 *                   type: string
 *                   description: The ID of the owner user.
 *                 companyName:
 *                   type: string
 *                   description: The name of the company.
 *                 legalName:
 *                   type: string
 *                   description: The legal name of the company.
 *       500:
 *         description: Internal server error.
 */
router.post('/members/:userId', MemberController.createMember);

/**
 * @swagger
 * /members/projects:
 *   get:
 *     summary: Get all projects for a member
 *     tags: [Members]
 *     description: Retrieve all projects associated with a specific member.
 *     parameters:
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: ['public', 'private']
 *         description: Filter by project visibility
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: page
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: string
 *         description: pageSize
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["In Progress", "Active", "Stand by"]
 *         description: Filter by project status
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by projects created on or after the given date
 *     responses:
 *       '200':
 *         description: A list of projects associated with the member.
 *       '404':
 *         description: Member not found.
 *       '500':
 *         description: Internal server error.
 */
router.get('/projects',AuthController.AuthenticateMember, MemberController.getAllProjectsForMember);

/**
 * @swagger
 * /members/projectswithoutpage:
 *   get:
 *     summary: Get all projects for a member
 *     tags: [Members]
 *     description: Retrieve all projects associated with a specific member.
 *     parameters:
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: ['public', 'private']
 *         description: Filter by project visibility
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["In Progress", "Active", "Stand by"]
 *         description: Filter by project status
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by projects created on or after the given date
 *     responses:
 *       '200':
 *         description: A list of projects associated with the member.
 *       '404':
 *         description: Member not found.
 *       '500':
 *         description: Internal server error.
 */
router.get('/projectswithoutpage',AuthController.AuthenticateMember, MemberController.getAllProjectsForMemberWithoutPagination);

/**
 * @swagger
 * /members/{id}:
 *   put:
 *     summary: Update a member
 *     description: Update member details by ID
 *     tags: [Member]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Member ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               legalName:
 *                 type: string
 *               website:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               desc:
 *                 type: string
 *               address:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               companyType:
 *                 type: string
 *               taxNbr:
 *                 type: string
 *               corporateNbr:
 *                 type: string
 *               logo:
 *                 type: string
 *               visbility:
 *                 type: string
 *                 enum: ['public', 'private']
 *               rc_ice:
 *                 type: string
 *               credits:
 *                 type: number
 *               subStatus:
 *                 type: string
 *                 enum: ['notActive', 'active']
 *               expireDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Member updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Member not found
 */
router.put('/members/:id', MemberController.updateMember);

/**
 * @swagger
 * /members/unique-countries:
 *   get:
 *     summary: Get unique countries
 *     description: Retrieve a list of unique countries from members
 *     responses:
 *       200:
 *         description: A list of unique countries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/unique-countries', MemberController.getUniqueCountries);
  
/**
 * @swagger
 * /members/unique-stages:
 *   get:
 *     summary: Get unique stages
 *     description: Retrieve a list of unique stages from members
 *     responses:
 *       200:
 *         description: A list of unique stages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/unique-stages', MemberController.getUniqueStages);

/**
 * @swagger
 * /members/unique-companyTypes:
 *   get:
 *     summary: Get unique company types
 *     description: Retrieve a list of unique company types from members
 *     responses:
 *       200:
 *         description: A list of unique company types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/unique-companyTypes', MemberController.getUniqueCompanyTypes);

/**
 * @swagger
 * /members/{userId}/create-test-company:
 *   post:
 *     summary: Create or update a test company
 *     description: Create or update a test company for a given user ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               legalName:
 *                 type: string
 *               website:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               desc:
 *                 type: string
 *               country:
 *                 type: string
 *                 enum:
 *                   - USA
 *                   - Canada
 *                   - France
 *                   - Germany
 *                   - Japan
 *                   - Morocco
 *                   - Other
 *               city:
 *                 type: string
 *                 enum:
 *                   - New York
 *                   - Los Angeles
 *                   - Toronto
 *                   - Paris
 *                   - Berlin
 *                   - Tokyo
 *                   - Casablanca
 *                   - Other
 *               stage:
 *                 type: string
 *                 enum:
 *                   - Idea
 *                   - Pree-Seed
 *                   - Seed
 *                   - Serie A
 *                   - Serie B
 *                   - Serie C
 *                   - Serie D
 *                   - Serie E
 *                   - IPO
 *               companyType:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum:
 *                     - Fintech
 *                     - Healthtech
 *                     - ECommerce
 *                     - Edutech
 *                     - Travel
 *                     - CRM
 *                     - HRM
 *               taxIdentfier:
 *                 type: string
 *               corporateNbr:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Company created or updated successfully
 *       500:
 *         description: Error creating or updating company
 */
router.post('/:userId/create-test-company', upload.single('logo'), MemberController.createTestCompany);

/**
 * @swagger
 * /members/{id}:
 *   put:
 *     summary: Update an existing member
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the member to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *                 description: The name of the company
 *               legalName:
 *                 type: string
 *                 description: The legal name of the company
 *               website:
 *                 type: string
 *                 description: The website of the company
 *               contactEmail:
 *                 type: string
 *                 description: The contact email of the company
 *               desc:
 *                 type: string
 *                 description: A description of the company
 *               address:
 *                 type: string
 *                 description: The address of the company
 *               country:
 *                 type: string
 *                 description: The country of the company
 *               city:
 *                 type: string
 *                 description: The city of the company
 *               companyType:
 *                 type: string
 *                 description: The type of the company
 *               taxNbr:
 *                 type: string
 *                 description: The tax number of the company
 *               corporateNbr:
 *                 type: string
 *                 description: The corporate number of the company
 *               logo:
 *                 type: string
 *                 description: The logo of the company
 *               stage:
 *                 type: string
 *                 description: The stage of the company
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *               rc_ice:
 *                 type: string
 *               dateCreated:
 *                 type: string
 *                 format: date
 *               credits:
 *                 type: number
 *               subStatus:
 *                 type: string
 *                 enum: [notActive, active]
 *               expireDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: The member was successfully updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Member not found
 */
router.put("/:id", MemberController.updateMember);

/**
 * @swagger
 * /members/my-investors:
 *   get:
 *     summary: Get investors for a member
 *     description: Retrieve a list of investors associated with a specific member.
 *     tags:
 *       - Members
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
 *       500:
 *         description: Internal server error
 */
router.get('/my-investors', AuthController.AuthenticateMember , MemberController.getInvestorsForMember);

/**
 * @swagger
 * /members/investors/distinct/{field}:
 *   get:
 *     summary: Get distinct values of a specified field from investors
 *     tags: [Members]
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
router.get('/investors/distinct/:field', AuthController.AuthenticateMember , MemberController.getDistinctInvestorFieldValues);

/**
 * @swagger
 * /members/request/distinct/{field}:
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
router.get('/request/distinct/:field', AuthController.AuthenticateMember ,  MemberController.getDistinctRequestFieldValues);

module.exports = router;

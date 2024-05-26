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
 *                 required:
 *                   - firstName
 *                   - lastName
 *                   - role
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 owner:
 *                   type: string
 *                 name:
 *                   type: string
 *                 funding:
 *                   type: number
 *                 totalRaised:
 *                   type: number
 *                 currency:
 *                   type: string
 *                 stages:
 *                   type: array
 *                   items:
 *                     type: string
 *                 listMembers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       role:
 *                         type: string
 *                 details:
 *                   type: string
 *                 milestones:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       dueDate:
 *                         type: string
 *                         format: date
 *                       completed:
 *                         type: boolean
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       link:
 *                         type: string
 *                       type:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *               example:
 *                 _id: "6506416714210c86698c9a0b"
 *                 owner: "64fa0ba0292541eeda787241"
 *                 name: "StartUP"
 *                 funding: 7777777777.0
 *                 currency: "€"
 *                 listMembers:
 *                   - firstName: "John"
 *                     lastName: "Doe"
 *                     role: "Developer"
 *                 details: "Project details"
 *                 milestones:
 *                   - name: "Milestone 1"
 *                     description: "Description of Milestone 1"
 *                     dueDate: "2024-04-30"
 *                     completed: false
 *                   - name: "Milestone 2"
 *                     description: "Description of Milestone 2"
 *                     dueDate: "2024-05-15"
 *                     completed: false
 *                 documents:
 *                   - name: "Document1"
 *                     link: "http://example.com/document1.pdf"
 *                     type: "application/pdf"
 *                     date: "2024-04-16"
 *       400:
 *         description: Bad Request - Invalid input data
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       500:
 *         description: Internal Server Error
 */

router.route("/project").post(AuthController.AuthenticateMember, upload.fields([{ name: 'businessPlan', maxCount: 1 },{ name: 'financialProjection', maxCount: 1 },{ name: 'pitchDeck', maxCount: 1 },{ name: 'files', maxCount: 8 }]), MemberController.createProject)

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
 *                 required:
 *                   - firstName
 *                   - lastName
 *                   - role
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
router.put("/project/:projectId", AuthController.AuthenticateMember, upload.fields([{ name: 'businessPlan', maxCount: 1 },{ name: 'financialProjection', maxCount: 1 },{ name: 'pitchDeck', maxCount: 1 },{ name: 'files', maxCount: 8 }]), MemberController.updateProject);

/**
 * @swagger
 * tags:
 *   name: Members
 * /members/ContactRequest/{investorId}:
 *   post:
 *     summary: create a contact request by the investor ID
 *     description: create a contact request to the investor desired by its investor ID
 *     tags: [Members]
 *     security:
 *       - jwtToken: []
 *     parameters:
 *       - name: investorId
 *         in: path
 *         description: The id of investor that needs to be fetched.
 *         required: true
 *         schema:
 *           type: string
 *     example:
 *       investorId: "e45gjse4442"
 *     responses:
 *       200:
 *         description: Successful response
 */
router.route("/ContactRequest/:investorId").post(AuthController.AuthenticateSubMember, MemberController.contactRequest )

/**
 * @swagger
 * /members/ContactRequest:
 *   get:
 *     summary: Get all contact requests of the member 
 *     description: list of all the member's contact requets sent to investor 
 *     tags: [Members]
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
router.route("/ContactRequest").get(AuthController.AuthenticateMember, MemberController.getContactRequests)

/**
 * @swagger
 * /members/SubscribeMember/{subid}:
 *   get:
 *     summary: Add a subscription to an unscribed member 
 *     description: u need to enter the subscription id of the three offers Bronze Silver and Gold u want subscribe to all of them are different from the number of credits the price and duration
 *     tags: [Members]
 *     security:
 *       - jwtToken: []
 *     parameters:
 *       - name: subid
 *         in: path
 *         description: The id of subscription to be fetched.
 *         required: true 
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
router.route("/SubscribeMember/:subid").get(AuthController.AuthenticateMember, MemberController.subUser)

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
 * /members/employee:
 *   post:
 *     summary: Create an employee for a member
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
 *               fullName:
 *                 type: string
 *                 description: The full name of the employee
 *               workEmail:
 *                 type: string
 *                 format: email
 *                 description: The work email of the employee
 *               address:
 *                 type: string
 *                 description: The address of the employee
 *               country:
 *                 type: string
 *                 description: The country of the employee
 *               department:
 *                 type: string
 *                 description: The department of the employee
 *               cityState:
 *                 type: string
 *                 description: The city and state of the employee
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: The start date of the employee
 *               jobTitle:
 *                 type: string
 *                 description: The job title of the employee
 *               typeEmp:
 *                 type: string
 *                 description: The type of the employee
 *               personalTaxIdentifierNumber:
 *                 type: string
 *                 description: The personal tax identifier number of the employee
 *               level:
 *                 type: string
 *                 description: The level of the employee
 *               status:
 *                 type: string
 *                 default: Active
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: The photo of the employee
 *     responses:
 *       200:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
 *       400:
 *         description: Bad request, check the request body
 */
router.post("/employee",AuthController.AuthenticateMember, upload.single("photo"), MemberController.createEmployee);

/**
 * @swagger
 * /members/{employeeId}/employee:
 *   put:
 *     summary: Mettre à jour un employé.
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               workEmail:
 *                 type: string
 *               personalEmail:
 *                 type: string
 *               address:
 *                 type: string
 *               country:
 *                 type: string
 *               department:
 *                 type: string
 *               cityState:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               jobTitle:
 *                 type: string
 *               typeEmp:
 *                 type: string
 *               personalTaxIdentifierNumber:
 *                 type: string
 *               level:
 *                 type: string
 *               status:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: The photo of the employee
 *     responses:
 *       '200':
 *         description: Employé mis à jour avec succès.
 *       '400':
 *         description: Erreur lors de la mise à jour de l'employé.
 */
router.put('/:employeeId:employee',AuthController.AuthenticateMember, upload.single('photo'), MemberController.updateEmployee);

/**
 * @swagger
 * /members/{employeeId}/employee:
 *   delete:
 *     summary: Supprimer un employé.
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Employé supprimé avec succès.
 *       '400':
 *         description: Erreur lors de la suppression de l'employé.
 */
router.delete('/:employeeId/employee',AuthController.AuthenticateMember,  MemberController.deleteEmployee);

/**
 * @swagger
 * /members/legal-document:
 *   post:
 *     summary: Create a legal document for a member
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
 *               name:
 *                 type: string
 *                 description: The name of the legal document
 *               link:
 *                 type: string
 *                 description: The link to the legal document
 *               description:
 *                 type: string
 *                 description: Additional description of the legal document
 *               cityState:
 *                 type: string
 *                 description: The city and state related to the legal document
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date of the legal document
 *               type:
 *                 type: string
 *                 description: The type of the legal document
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: The file of the legal document
 *     responses:
 *       200:
 *         description: Legal document created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
 *       400:
 *         description: Bad request, check the request body
 */
router.post("/legal-document",AuthController.AuthenticateMember, upload.single("document"), MemberController.createLegalDocument);
/**
 * @swagger
 * /members/{documentId}/legal-document:
 *   put:
 *     summary: Mettre à jour un document légal.
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the legal document
 *               link:
 *                 type: string
 *                 description: The link to the legal document
 *               description:
 *                 type: string
 *                 description: Additional description of the legal document
 *               cityState:
 *                 type: string
 *                 description: The city and state related to the legal document
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date of the legal document
 *               type:
 *                 type: string
 *                 description: The type of the legal document
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: The file of the legal document
 *     responses:
 *       '200':
 *         description: Document légal mis à jour avec succès.
 *       '400':
 *         description: Erreur lors de la mise à jour du document légal.
 */
router.put('/:documentId/legal-document',AuthController.AuthenticateMember, upload.single("document"), MemberController.updateLegalDocument);

/**
 * @swagger
 * /members/{documentId}/legal-document:
 *   delete:
 *     summary: Supprimer un document légal.
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Document légal supprimé avec succès.
 *       '400':
 *         description: Erreur lors de la suppression du document légal.
 */
router.delete('/:documentId/legal-document',AuthController.AuthenticateMember,  MemberController.deleteLegalDocument);

/**
 * @swagger
 * /members/{userId}:
 *   post:
 *     summary: Create a member
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user who owns the member
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visbility:
 *                 type: string
 *               credits:
 *                 type: number
 *               
 *     responses:
 *       201:
 *         description: Member created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
 *       400:
 *         description: Bad request, check the request body
 */
router.post("/:userId", MemberController.createMember);

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
 *     responses:
 *       '200':
 *         description: A list of projects associated with the member.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 owner:
 *                   type: string
 *                 name:
 *                   type: string
 *                 funding:
 *                   type: number
 *                 currency:
 *                   type: string
 *                   enum: ['MAD','€','$', "USD"]
 *                   default: "USD"
 *                 status:
 *                   type: string
 *                   enum: ["In Progress", "Active" , "Stand by"]
 *                   default : "In Progress"
 *                 stages:
 *                   type: array
 *                   items:
 *                     type: string
 *                 listMembers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       role:
 *                         type: string
 *                 details:
 *                   type: string
 *                 milestones:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       dueDate:
 *                         type: string
 *                         format: date
 *                       completed:
 *                         type: boolean
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       link:
 *                         type: string
 *                       type:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *       '404':
 *         description: Member not found.
 *       '500':
 *         description: Internal server error.
 */
router.get('/projects',AuthController.AuthenticateMember, MemberController.getAllProjectsForMember);

module.exports = router;



module.exports = router
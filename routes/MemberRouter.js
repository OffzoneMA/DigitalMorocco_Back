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
 * tags:
 *   name: Members
 *   description: Managing API of the Member (or Start-Up) 
 * /members/employees:
 *   get:
 *     summary: Get all employees from the DB
 *     description: list of all employees exited 
 *     tags: [Employees]
 *     security:
 *       - jwtToken: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 */
router.route("/employees").get( MemberController.getEmployees)

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Managing API for Employees
 * /members/employees/{employeeId}:
 *   delete:
 *     summary: Delete an employee by ID
 *     description: Delete an employee from the database by their ID.
 *     tags: [Employees]
 *     security:
 *       - jwtToken: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the employee to delete
 *     responses:
 *       204:
 *         description: Employee deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */
router.route("/employees/:employeeId").delete( MemberController.deleteEmployeeFromMember)

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Managing API of the Member (or Start-Up)
 * /members/{userId}/employees/{employeeId}:
 *   put:
 *     summary: Mettre à jour les informations d'un employé d'un membre
 *     description: Endpoint permettant de mettre à jour les informations d'un employé dans un membre existant
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: L'ID du membre contenant l'employé à mettre à jour
 *         schema:
 *           type: string
 *       - in: path
 *         name: employeeId
 *         required: true
 *         description: L'ID de l'employé à mettre à jour
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               jobTitle:
 *                 type: string
 *               level:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: ['active', 'offline']
 *               address:
 *                 type: string
 *               country:
 *                 type: string
 *               cityState:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               personalTaxIdentifierNumber:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *               department:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Les informations de l'employé ont été mises à jour avec succès
 *       '400':
 *         description: Requête invalide
 *       '401':
 *         description: Non autorisé
 *       '404':
 *         description: Membre ou employé non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
router.route("/:userId/employees/:employeeId").put( MemberController.updateEmployeeFromMember)

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Managing API of the Member (or Start-Up) 
 * /members/employees:
 *   post:
 *     summary: Ajouter un employé à un membre
 *     description: Endpoint permettant d'ajouter un employé à un membre existant
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: L'ID du membre auquel l'employé doit être ajouté
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
router.route("/employees/:userId").post(AuthController.AuthenticateSubMemberOrAdmin,MemberController.addEmployeeToMember)

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
router.route("/company/:userId").post(AuthController.AuthenticateSubMemberOrAdmin,MemberController.addCompanyToMember)

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Managing API of the Member (or Start-Up)
 * /members/{userId}/legal-documents:
 *   post:
 *     summary: Ajouter un document légal à un membre
 *     description: Endpoint permettant d'ajouter un document légal à un membre existant
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: L'ID du membre auquel le document doit être ajouté
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
 *               link:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Document légal ajouté avec succès
 *       '400':
 *         description: Requête invalide
 *       '401':
 *         description: Non autorisé
 *       '500':
 *         description: Erreur interne du serveur
 */
router.post('/:userId/legal-documents', MemberController.addLegalDocumentToMember);


router.delete('/legal-documents/:id', MemberController.deleteLegalDocument);


router.put('/:userId/legal-documents/:id', MemberController.editLegalDocument);

/**
 * @swagger
 * /legal-documents:
 *   get:
 *     summary: Get all legal documents
 *     description: Retrieve a list of all legal documents stored in the database.
 *     tags: [Legal Documents]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                     description: The name of the legal document.
 *                   lastModified:
 *                     type: string
 *                     description: The last modified date of the legal document.
 *                   owner:
 *                     type: string
 *                     description: The owner of the legal document.
 *                   ...
 *                 required:
 *                   - _id
 *                   - name
 *                   - lastModified
 *                   - owner
 *                 example:
 *                   - _id: "610af7651154c22cf4f20c19"
 *                     name: "Document 1"
 *                     lastModified: "2023-05-01T12:00:00.000Z"
 *                     owner: "John Doe"
 *                   - _id: "610af7651154c22cf4f20c1a"
 *                     name: "Document 2"
 *                     lastModified: "2023-05-02T10:30:00.000Z"
 *                     owner: "Jane Smith"
 */
router.get('/legal-documents', MemberController.getLegalDocuments);

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
 *               - listMembers
 *               - details
 *               - milestoneProgress
 *               - documents
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the project.
 *               funding:
 *                 type: number
 *                 description: The funding amount for the project.
 *               currency:
 *                 type: string
 *                 enum: [MAD, €, $]
 *                 description: The currency of the funding amount.
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
 *               milestoneProgress:
 *                 type: string
 *                 description: Progress status of the project milestones.
 *               files:
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
 *                     type:
 *                       type: string
 *                       description: type of the document.
 *                     date:
 *                       type: string
 *                       description: date of the document.
 *           example:
 *             name: "ProjectName"
 *             funding: 10000.0
 *             currency: "€"
 *             listMembers:
 *               - firstName: "John"
 *                 lastName: "Doe"
 *                 role: "Developer"
 *             details: "Project details"
 *             milestoneProgress: "50%"
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
 *                 currency:
 *                   type: string
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
 *                 milestoneProgress:
 *                   type: string
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
 *               example:
 *                 _id: "6506416714210c86698c9a0b"
 *                 owner: "64fa0ba0292541eeda787241"
 *                 name: "StartUP"
 *                 funding: 7777777777.0
 *                 currency: "€"
 *                 listMembers:
 *                   - firstName: "jjjjjjjjj"
 *                     lastName: "jjjjjjjjjjj"
 *                     role: "hhhhhhhh"
 *                 details: "jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj"
 *                 milestoneProgress: "jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj"
 *                 documents:
 *                   - name: "pitchDeck"
 *                     link: "https://firebasestorage.googleapis.com/v0/b/digital-morocco-806c5.appspot.com/o/Members%2F64f9fa59bd2bd153bc8ff828%2FProject_documents%2FpitchDeck?alt=media&token=91fe9f36-0c85-4b6b-a296-6f556c200a6f"
 *                     type: "application/pdf"
 *                     date: "1694908775993"
 *                   - name: "businessPlan"
 *                     link: "https://firebasestorage.googleapis.com/v0/b/digital-morocco-806c5.appspot.com/o/Members%2F64f9fa59bd2bd153bc8ff828%2FProject_documents%2FbusinessPlan?alt=media&token=68f9c963-f922-413d-a44d-643e86728e36"
 *                     type: "application/pdf"
 *                     date: "1694908775994"
 *                   - name: "financialProjection"
 *                     link: "https://firebasestorage.googleapis.com/v0/b/digital-morocco-806c5.appspot.com/o/Members%2F64f9fa59bd2bd153bc8ff828%2FProject_documents%2FfinancialProjection?alt=media&token=177086e9-a568-4aa1-bfe8-b7da90acc37e"
 *                     type: "application/pdf"
 *                     date: "1694908775996"
 *       400:
 *         description: Bad Request - Invalid input data
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       500:
 *         description: Internal Server Error
 */
router.route("/project").post(AuthController.AuthenticateMember, upload.fields([{ name: 'files', maxCount: 8 }]), MemberController.createProject)

/**
 * @swagger
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

module.exports = router
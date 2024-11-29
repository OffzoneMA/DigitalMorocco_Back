const express = require("express")
const router = express.Router()
const PartnerController = require("../controllers/PartnerController")
const AuthController = require("../controllers/AuthController")
const upload = require("../middelware/multer")

/**
 * @swagger
 * components:
 *   schemas:
 *     Partner:
 *       type: object
 *       required:
 *         - owner
 *         - companyName
 *       properties:
 *         owner:
 *           type: string
 *           description: The user ID who owns the partner
 *         companyName:
 *           type: string
 *           description: The company name
 *         legalName:
 *           type: string
 *           description: The legal name
 *         website:
 *           type: string
 *           description: The website URL
 *         contactEmail:
 *           type: string
 *           description: The contact email
 *         desc:
 *           type: string
 *           description: Description of the company
 *         address:
 *           type: string
 *           description: The address of the company
 *         country:
 *           type: string
 *           description: The country
 *         city:
 *           type: string
 *           description: The city
 *         state:
 *           type: string
 *           description: The state
 *         companyType:
 *           type: string
 *           description: The type of company
 *         taxNbr:
 *           type: string
 *           description: The tax number
 *         corporateNbr:
 *           type: string
 *           description: The corporate number
 *         logo:
 *           type: string
 *           description: The URL of the company logo
 *         listEmployee:
 *           type: array
 *           items:
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
 *               type:
 *                 type: string
 *               personalTaxIdentifierNumber:
 *                 type: string
 *                 pattern: '^\d{4} - \d{4} - \d{4}$'
 *               level:
 *                 type: string
 *               status:
 *                 type: string
 *               image:
 *                 type: string
 *         legalDocument:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               cityState:
 *                 type: string
 *               link:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               type:
 *                 type: string
 *         visbility:
 *           type: string
 *           enum: [public, private]
 *         num_rc:
 *           type: string
 *         dateCreated:
 *           type: string
 *           format: date
 *           description: The date the partner was created
 */

/**
 * @swagger
 * tags:
 *   name: Partners
 *   description: Managing API of the Partner
 * /partners/all:
 *   get:
 *     summary: Get all partners from the DB
 *     description: list of all the exited partners
 *     tags: [Partners]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Partner'
 */
router.route("/all").get(PartnerController.getpartnersAll)


/**
 * @swagger
 * tags:
 *   name: Partners
 *   description: Managing API of the Partner
 * /partners:
 *   get:
 *     summary: Get all partners from the DB
 *     description: list of all the exited partners
 *     tags: [Partners]
 *     security:
 *       - jwtToken: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Partner'
 */
router.route("/").get(PartnerController.getpartners).post(AuthController.AuthenticatePartner, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'files', maxCount: 5 }]) ,PartnerController.createEnterprise)


/**
 * @swagger
 * /partners/Projects:
 *   get:
 *     summary: Get all member's projects 
 *     description: list of all member's projects 
 *     tags: [Partners]
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
router.route("/Projects").get(/*AuthController.AuthenticatePartner, */PartnerController.getProjects)

/**
 * @swagger
 * /partners/add:
 *   post:
 *     summary: Create a new partner
 *     tags: [Partners]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Partner'
 *     responses:
 *       201:
 *         description: The partner was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Partner'
 *       400:
 *         description: Bad request
 */
router.post('/add', PartnerController.addPartner);


/**
 * @swagger
 * /partners/{id}:
 *   get:
 *     summary: Get a partner by ID
 *     tags: [Partners]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The partner ID
 *     responses:
 *       200:
 *         description: The partner description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Partner'
 *       404:
 *         description: The partner was not found
 */
router.get('/:id', PartnerController.getPartnerById);

/**
 * @swagger
 * /partners/{id}:
 *   put:
 *     summary: Update a partner by ID
 *     tags: [Partners]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The partner ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Partner'
 *     responses:
 *       200:
 *         description: The partner was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Partner'
 *       404:
 *         description: The partner was not found
 *       400:
 *         description: Bad request
 */
router.put('/:id', PartnerController.updatePartner);

/**
 * @swagger
 * /partners/{id}:
 *   delete:
 *     summary: Delete a partner by ID
 *     tags: [Partners]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The partner ID
 *     responses:
 *       204:
 *         description: The partner was successfully deleted
 *       404:
 *         description: The partner was not found
 */
router.delete('/:id', PartnerController.deletePartner);

module.exports = router
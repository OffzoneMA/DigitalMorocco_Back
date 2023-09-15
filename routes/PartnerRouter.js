const express = require("express")
const router = express.Router()
const PartnerController = require("../controllers/PartnerController")
const AuthController = require("../controllers/AuthController")
const upload = require("../middelware/multer")


/**
 * @swagger
 * components:
 *   schemas:
 *     Patner:
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
 *           description: The auto-generated id of the partner(entreprise)
 *         companyName:
 *           type: string
 *           description: the name of the partner(entreprise)
 *         desc:
 *           type: string
 *           description: The description of the partner(entreprise)
 *         logo:
 *           type: string
 *           description: the logo of the partner(entreprise)
 *         website: 
 *           type: string
 *           description: the website of the partner(entreprise)
 *         
 *       example:
 *         id: 64e0b85a9c819e682229ca82
 *         companyName: D&K
 *         desc: Enhancing health care through digital patient-provider connectivity.
 *         logo: https://firebasestorage.googleapis.com/v0/b/digital-morocco-806c5.appspot.com/o/Members%2F64d0fd3f4ad21c95e8456f69%2Flogo?alt=media&token=4e609d74-43a4-4f8b-926f-3b8c19a70d37
 *         website: D$K.net
 */
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


module.exports = router
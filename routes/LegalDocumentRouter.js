const LegalDocumentController = require('../controllers/LegalDocumentController');
const express = require('express');
const router = express.Router();
const upload = require('../middelware/multer');
const AuthController = require('../controllers/AuthController');

/**
 * @swagger
 * tags:
 *   name: Legal Documents
 *   description: Legal Document management
 */

/**
 * @swagger
 * components:
 *    schemas:
 *      LegalDocument:
 *        type: object
 *        properties:
 *          id:
 *            type: string
 *            description: The auto-generated id of the legal document
 *          title:
 *            type: string
 *            description: The title of the legal document
 *          link:
 *            type: string
 *            description: The link to the legal document
 *          type:
 *            type: string
 *            description: The type of the legal document
 *          name:
 *            type: string
 *            description: The name of the legal document
 *          createdBy:
 *            type: string
 *            description: The id of the user who created the legal document
 *          updatedBy:
 *            type: string
 *            description: The id of the user who last updated the legal document
 *          createdAt:
 *            type: string
 *            format: date
 *            description: The date of creation of the legal document
 *          updatedAt:
 *            type: string
 *            format: date
 *            description: The date of the last update of the legal document
 */

/**
 * @swagger
 * /legal-documents:
 *    post:
 *      summary: Create a new legal document
 *      tags: [Legal Documents]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                  description: The title of the legal document
 *                file:
 *                  type: string
 *                  format: binary
 *                  description: The file of the legal document
 *      responses:
 *        "201":
 *          description: The created legal document
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/LegalDocument'
 *        "400":
 *          description: Bad request
 *        "401":
 *          description: Unauthorized
 *        "500":
 *          description: Internal server error
 */
router.post('/', AuthController.AuthenticateUser, upload.single('file'), LegalDocumentController.createLegalDocument);

/**
 * @swagger
 * /legal-documents/byuser:
 *    get:
 *      summary: Get all legal documents by user
 *      tags: [Legal Documents]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        "200":
 *          description: The list of legal documents by the user
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/LegalDocument'
 *        "400":
 *          description: Bad request
 *        "401":
 *          description: Unauthorized
 *        "500":
 *          description: Internal server error
 */
router.get('/byuser', AuthController.AuthenticateUser, LegalDocumentController.getLegalDocumentsByUser);


/**
 * @swagger
 * /legal-documents/{documentId}:
 *    get:
 *      summary: Get a legal document by id
 *      tags: [Legal Documents]
 *      parameters:
 *        - in: path
 *          name: documentId
 *          schema:
 *            type: string
 *          required: true
 *          description: The id of the legal document
 *      responses:
 *        "200":
 *          description: The legal document
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/LegalDocument'
 *        "400":
 *          description: Bad request
 *        "401":
 *          description: Unauthorized
 *        "500":
 *          description: Internal server error
 */
router.get('/:documentId', LegalDocumentController.getLegalDocumentById);

/**
 * @swagger
 * /legal-documents/{documentId}:
 *    delete:
 *      summary: Delete a legal document
 *      tags: [Legal Documents]
 *      parameters:
 *        - in: path
 *          name: documentId
 *          schema:
 *            type: string
 *          required: true
 *          description: The id of the legal document
 *      responses:
 *        "200":
 *          description: The legal document was successfully deleted
 *        "400":
 *          description: Bad request
 *        "401":
 *          description: Unauthorized
 *        "500":
 *          description: Internal server error
 */
router.delete('/:documentId', LegalDocumentController.deleteLegalDocument);

/**
 * @swagger
 * /legal-documents/{documentId}:
 *    put:
 *      summary: Update a legal document
 *      tags: [Legal Documents]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: documentId
 *          schema:
 *            type: string
 *          required: true
 *          description: The id of the legal document
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                  description: The title of the legal document
 *                file:
 *                  type: string
 *                  format: binary
 *                  description: The file of the legal document
 *      responses:
 *        "200":
 *          description: The updated legal document
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/LegalDocument'
 *        "400":
 *          description: Bad request
 *        "401":
 *          description: Unauthorized
 *        "500":
 *          description: Internal server error
 */
router.put('/:documentId', AuthController.AuthenticateUser, upload.single('file'), LegalDocumentController.updateLegalDocument);

/**
 * @swagger
 * /legal-documents:
 *    get:
 *      summary: Get all legal documents
 *      tags: [Legal Documents]
 *      responses:
 *        "200":
 *          description: The list of legal documents
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/LegalDocument'
 *        "400":
 *          description: Bad request
 *        "401":
 *          description: Unauthorized
 *        "500":
 *          description: Internal server error
 */
router.get('/', LegalDocumentController.getLegalDocuments);

module.exports = router;
